const DEFAULT_TTL_MS = 5 * 60 * 1000;

const pageCache = new Map();
const inflightRequests = new Map();

const buildCacheKey = (page, language, section = "") =>
    `${page}:${language}:${section || "_all_"}`;

const isFresh = (entry) => entry && Date.now() < entry.expiresAt;

export const readCachedPublicPage = (page, language, section = "") => {
    const entry = pageCache.get(buildCacheKey(page, language, section));

    if (!isFresh(entry)) {
        if (entry) {
            pageCache.delete(buildCacheKey(page, language, section));
        }

        return null;
    }

    return entry.data;
};

export const writeCachedPublicPage = (
    page,
    language,
    section = "",
    data,
    ttlMs = DEFAULT_TTL_MS
) => {
    pageCache.set(buildCacheKey(page, language, section), {
        data,
        expiresAt: Date.now() + ttlMs,
    });
};

export const invalidateCachedPublicPage = (page) => {
    for (const key of pageCache.keys()) {
        if (key.startsWith(`${page}:`)) {
            pageCache.delete(key);
        }
    }
    for (const key of inflightRequests.keys()) {
        if (key.startsWith(`${page}:`)) inflightRequests.delete(key);
    }
    if (page === "events" || page === "faq") invalidateCachedPublicPage("home");
};

export const fetchPublicPageWithCache = async ({
    page,
    language,
    section = "",
    fetcher,
}) => {
    const cacheKey = buildCacheKey(page, language, section);
    const cached = readCachedPublicPage(page, language, section);

    if (cached) {
        return cached;
    }

    if (inflightRequests.has(cacheKey)) {
        return inflightRequests.get(cacheKey);
    }

    // A cached request belongs to all consumers, not the first component.
    // Hook cleanup guards its own state; it must not abort other subscribers
    // or the request reused by React StrictMode's immediate remount.
    const requestPromise = fetcher({})
        .then((data) => {
            if (inflightRequests.get(cacheKey) === requestPromise) {
                writeCachedPublicPage(page, language, section, data);
                inflightRequests.delete(cacheKey);
            }

            return data;
        })
        .catch((error) => {
            if (inflightRequests.get(cacheKey) === requestPromise) inflightRequests.delete(cacheKey);
            throw error;
        });

    inflightRequests.set(cacheKey, requestPromise);

    return requestPromise;
};
