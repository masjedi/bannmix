/**

 * Format a badge count for sidebar nav items.

 * Returns `null` for empty / zero / negative so callers can do

 * `displayedBadge && <span>...</span>` cleanly.

 *

 *   0  -> null

 *   7  -> "7"

 *   99 -> "99"

 *   100 -> "99+"

 */

export const formatBadgeCount = (count) => {
    if (!count || count <= 0) return null;

    if (count > 99) return "99+";

    return count.toString();
};

/**

 * Determine whether a route should be considered active.

 * Mimics React Router's `<NavLink>` active matching so the

 * sidebar can highlight items before they actually mount.

 */

export const getRouteActive = (pathname, to, end = false) => {
    if (!to) return false;

    if (end) return pathname === to;

    return pathname === to || pathname.startsWith(`${to}/`);
};

export const normalizeList = (response) => {
    const payload = response?.data ?? response;
    const list = payload?.data ?? payload;

    return Array.isArray(list) ? list : [];
};

export const getErrorMessage = (error, fallback = "Something went wrong.") =>
    error?.response?.data?.message || error?.message || fallback;

export const getPostContent = (post) =>
    post?.content || post?.body || post?.description || "";

export const includesSearch = (values, query) => {
    const normalizedQuery = String(query ?? "").trim().toLowerCase();

    const candidates = Array.isArray(values) ? values : [values];

    return (
        normalizedQuery === "" ||
        candidates.some((value) =>
            String(value ?? "").toLowerCase().includes(normalizedQuery)
        )
    );
};

export const formatRelativeTime = (value) => {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) return "Unknown time";

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (elapsedSeconds < 60) return "Just now";

    const units = [
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    const [unit, seconds] = units.find(([, size]) => elapsedSeconds >= size);
    const amount = Math.floor(elapsedSeconds / seconds);

    return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
};

const CRUMB_LABELS = {
    admin: "Dashboard",
    posts: "Products",
    "site-contents": "Website Content",
};

export const deriveCrumbs = (pathname) =>
    String(pathname ?? "")
        .split("/")
        .filter(Boolean)
        .map((segment) =>
            CRUMB_LABELS[segment] ||
            segment
                .replace(/-/g, " ")
                .replace(/\b\w/g, (character) => character.toUpperCase())
        );
