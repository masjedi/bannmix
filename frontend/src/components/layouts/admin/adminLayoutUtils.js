/**
 * Format a badge count for sidebar nav items.
 */
export const formatBadgeCount = (count) => {
    if (!count || count <= 0) return null;

    if (count > 99) return "99+";

    return count.toString();
};

export const getRouteActive = (pathname, to, end = false) => {
    if (!to) return false;

    if (end) return pathname === to;

    return pathname === to || pathname.startsWith(`${to}/`);
};

export const isSiteContentNavActive = (pathname, search, page, section = "") => {
    if (pathname !== "/admin/site-contents") {
        return false;
    }

    const params = new URLSearchParams(search);
    const activePage = params.get("page") || "";
    const activeSection = params.get("section") || "";

    if (page && activePage !== page) {
        return false;
    }

    if (!page && activePage) {
        return false;
    }

    if (section) {
        return activeSection === section;
    }

    return !activeSection;
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

const PAGE_LABELS = {
    home: "Home",
    about: "About Us",
    products: "Products Page",
    services: "Services",
    events: "Events",
    gallery: "Gallery",
    contact: "Contact Us",
    faq: "FAQ",
};

const SECTION_LABELS = {
    hero: "Hero",
    trust_strip: "Trust Strip",
    majoon: "Our Majoon",
    intro_video: "Intro Video",
    quality: "Quality & Ingredients",
    about_intro: "About Intro",
    audience: "Who We Serve",
    highlights: "Highlights",
    ordering: "Ordering Process",
    distribution: "Distribution",
    news: "News & Updates",
    testimonials: "Testimonials",
    faq: "FAQ",
    story: "Our Story",
    mission: "Mission",
    vision: "Vision",
    values: "Values",
    team: "Leadership Team",
    gallery: "Gallery",
    intro: "Intro",
    items: "Items",
    location: "Location",
};

const getPageLabel = (page) => PAGE_LABELS[page] ?? page;
const getSectionLabel = (section) =>
    SECTION_LABELS[section] ??
    section.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

/**
 * Build clickable admin breadcrumb items from the current route.
 *
 * @returns {Array<{ label: string, to: string | null }>}
 */
export const buildAdminBreadcrumbs = (pathname, search = "") => {
    const crumbs = [{ label: "Home", to: "/admin" }];

    if (pathname === "/admin" || pathname === "/admin/") {
        crumbs.push({ label: "Dashboard", to: null });
        return crumbs;
    }

    if (pathname.startsWith("/admin/posts")) {
        crumbs.push({ label: "Products", to: "/admin/posts" });

        if (/^\/admin\/posts\/[^/]+/.test(pathname)) {
            crumbs.push({ label: "Product Details", to: null });
        }

        return crumbs;
    }

    if (pathname.startsWith("/admin/site-contents")) {
        crumbs.push({ label: "Website Content", to: "/admin/site-contents" });

        const params = new URLSearchParams(search);
        const page = params.get("page") || "";
        const section = params.get("section") || "";

        if (page) {
            crumbs.push({
                label: getPageLabel(page),
                to: section ? `/admin/site-contents?page=${page}` : null,
            });
        }

        if (page && section) {
            crumbs.push({
                label: getSectionLabel(section),
                to: null,
            });
        } else if (page) {
            crumbs[crumbs.length - 1].to = null;
        } else {
            crumbs[crumbs.length - 1].to = null;
        }

        return crumbs;
    }

    const segments = String(pathname).split("/").filter(Boolean).slice(1);

    segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        const label =
            CRUMB_LABELS[segment] ||
            segment.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());

        crumbs.push({
            label,
            to: isLast ? null : `/admin/${segments.slice(0, index + 1).join("/")}`,
        });
    });

    return crumbs;
};
