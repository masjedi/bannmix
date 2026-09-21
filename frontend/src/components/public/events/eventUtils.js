import { CalendarDays, MapPin, Users } from "lucide-react";

import { htmlToPlainText } from "../../../utils/htmlText";

const EVENT_ICONS = [CalendarDays, MapPin, Users];
const EVENT_TONES = [
    "from-brand-orange/20 to-white dark:from-brand-orange/20 dark:to-theme-page",
    "from-brand-blue/20 to-white dark:from-brand-blue/20 dark:to-theme-page",
    "from-brand-green/15 to-white dark:from-brand-blue/15 dark:to-theme-page",
];

export const normalizeEventItems = (cmsItems = []) => {
    if (!Array.isArray(cmsItems) || cmsItems.length === 0) {
        return [];
    }

    return cmsItems.map((item, index) => ({
        id: item.id ?? null,
        slug: item.content_key || (item.id != null ? `event-${item.id}` : `event-${index}`),
        icon: EVENT_ICONS[index % EVENT_ICONS.length],
        title: item.title || "",
        subtitle: item.subtitle || "",
        content: item.content || item.description || "",
        excerpt: htmlToPlainText(item.content || item.description || ""),
        image_url: item.image_url || "",
        tone: EVENT_TONES[index % EVENT_TONES.length],
        button_text: item.button_text || "",
        button_url: item.button_url || "",
    }));
};

export const getEventDetailPath = (item) => {
    if (!item) return "/events";

    if (item.id != null) {
        return `/events/${item.id}`;
    }

    if (item.slug) {
        return `/events/${item.slug}`;
    }

    return "/events";
};

export const resolveEventByParam = (items, param) => {
    if (!param || !Array.isArray(items)) {
        return null;
    }

    const decoded = decodeURIComponent(param);

    const byId = items.find(
        (item) => item.id != null && String(item.id) === decoded
    );
    if (byId) return byId;

    const bySlug = items.find(
        (item) =>
            item.slug === decoded ||
            item.content_key === decoded ||
            item.slug?.toLowerCase() === decoded.toLowerCase()
    );
    if (bySlug) return bySlug;

    return null;
};
