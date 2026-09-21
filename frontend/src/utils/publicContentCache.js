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
};

export const fetchPublicPageWithCache = async ({
    page,
    language,
    section = "",
    fetcher,
    signal,
}) => {
    const cacheKey = buildCacheKey(page, language, section);
    const cached = readCachedPublicPage(page, language, section);

    if (cached) {
        return cached;
    }

    if (inflightRequests.has(cacheKey)) {
        return inflightRequests.get(cacheKey);
    }

    const requestPromise = fetcher({ signal })
        .then((data) => {
            writeCachedPublicPage(page, language, section, data);
            inflightRequests.delete(cacheKey);

            return data;
        })
        .catch((error) => {
            inflightRequests.delete(cacheKey);
            throw error;
        });

    inflightRequests.set(cacheKey, requestPromise);

    return requestPromise;
};
