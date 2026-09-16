/**
 * Helpers for dynamic About page content mapping and layout.
 * CMS items typically expose: id, title, subtitle, content, button_text,
 * button_url, image_url, metadata, content_key, sort_order.
 */

export const hasText = (value) =>
    typeof value === "string" && value.trim().length > 0;

export const pickFirst = (...values) => {
    for (const value of values) {
        if (hasText(value)) return value.trim();
        if (value && typeof value === "object" && !Array.isArray(value)) {
            // allow accidental nested objects only if they somehow pass
            continue;
        }
    }
    return "";
};

export const pickImage = (item) => {
    if (!item || typeof item !== "object") return "";
    const meta = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
    return pickFirst(
        item.image_url,
        item.image,
        item.imageUrl,
        meta.image_url,
        meta.image
    );
};

export const pickDescription = (item) => {
    if (!item || typeof item !== "object") return "";
    const meta = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
    return pickFirst(
        item.content,
        item.description,
        item.body,
        meta.description,
        meta.body
    );
};

/** Resolve the first non-empty section from a list of possible CMS section keys. */
export const resolveSection = (getSection, names = []) => {
    for (const name of names) {
        const items = getSection?.(name) ?? [];
        if (Array.isArray(items) && items.length > 0) return items;
    }
    return [];
};

export const resolveFirstItem = (getSection, getFirstSectionItem, names = []) => {
    for (const name of names) {
        const item = getFirstSectionItem?.(name);
        if (item) return item;
        const items = getSection?.(name) ?? [];
        if (items[0]) return items[0];
    }
    return null;
};

export const valuesGridClass = (count) => {
    if (count <= 1) return "mx-auto max-w-md grid-cols-1";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
};

export const teamGridClass = (count) => {
    if (count <= 1) return "mx-auto max-w-[420px] grid-cols-1";
    if (count === 2) return "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
};

export const getInitials = (name = "") => {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) return "BM";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const isExternalUrl = (url = "") =>
    /^https?:\/\//i.test(url) || url.startsWith("mailto:") || url.startsWith("tel:");

export const mapTeamMember = (item, index = 0) => {
    const meta = item?.metadata && typeof item.metadata === "object" ? item.metadata : {};
    return {
        id: item?.id ?? item?.content_key ?? `team-${index}`,
        name: pickFirst(item?.title, meta.name, "Team member"),
        position: pickFirst(
            item?.subtitle,
            meta.position,
            meta.role,
            meta.job_title
        ),
        description: pickDescription(item),
        image: pickImage(item),
        linkedin_url: pickFirst(meta.linkedin_url, meta.linkedin, item?.linkedin_url),
        facebook_url: pickFirst(meta.facebook_url, meta.facebook, item?.facebook_url),
        email: pickFirst(meta.email, item?.email),
    };
};

export const mapValueItem = (item, index = 0) => {
    const meta = item?.metadata && typeof item.metadata === "object" ? item.metadata : {};
    return {
        id: item?.id ?? item?.content_key ?? `value-${index}`,
        title: pickFirst(item?.title, meta.title, "Value"),
        description: pickDescription(item),
        icon: pickFirst(meta.icon, item?.icon),
    };
};

export const mapGalleryItem = (item, index = 0) => {
    const meta = item?.metadata && typeof item.metadata === "object" ? item.metadata : {};
    const image = pickImage(item);
    return {
        id: item?.id ?? item?.content_key ?? `gallery-${index}`,
        image,
        title: pickFirst(item?.title, meta.title, meta.caption),
        description: pickDescription(item),
    };
};
