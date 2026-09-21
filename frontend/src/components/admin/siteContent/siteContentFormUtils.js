import { TRANSLATABLE_KEYS } from "./siteContentFormSchemas";
import { extractYouTubeId } from "../../public/home/youtube";
import { htmlToPlainText, isEmptyHtml } from "../../../utils/htmlText";

export const createTranslations = () => ({
    en: "",
    ps: "",
    fa: "",
});

export const createEmptyForm = (page = "home", section = "") => ({
    page,
    section,
    content_key: "",

    title: createTranslations(),
    subtitle: createTranslations(),
    content: createTranslations(),
    button_text: createTranslations(),

    button_url: "",
    video_url: "",

    sort_order: 0,
    is_active: true,

    image: null,
    image_path: "",
    image_url: "",
    remove_image: false,

    existing_images: [],
    new_images: [],
    removed_image_paths: [],
});

export const normalizeTranslations = (value) => ({
    en: value?.en ?? "",
    ps: value?.ps ?? "",
    fa: value?.fa ?? "",
});

export const slugify = (value = "") =>
    String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);

export const slugifyKey = (value = "") =>
    String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80);

export const collectExistingImages = (content) => {
    if (!content || typeof content !== "object") {
        return [];
    }

    if (Array.isArray(content.image_urls) && content.image_urls.length > 0) {
        const metadataPaths = Array.isArray(content.metadata?.images)
            ? content.metadata.images.filter(Boolean)
            : [];

        return content.image_urls.map((url, index) => ({
            path: metadataPaths[index] || content.image_path || `image-${index}`,
            url,
        }));
    }

    if (content.image_url) {
        return [
            {
                path: content.image_path || content.image_url,
                url: content.image_url,
            },
        ];
    }

    return [];
};

export const getVisibleExistingImages = (form) =>
    (form.existing_images ?? []).filter(
        (image) => !(form.removed_image_paths ?? []).includes(image.path)
    );

export const countActiveImages = (form) =>
    getVisibleExistingImages(form).length + (form.new_images ?? []).length;

export const getDisplayTitle = (content) =>
    content?.title?.en ||
    content?.title?.ps ||
    content?.title?.fa ||
    content?.content?.en ||
    content?.content?.ps ||
    content?.content?.fa ||
    content?.content_key ||
    "Untitled";

export const hasLanguageContent = (content, languageCode) => {
    const fields = [content?.title, content?.subtitle, content?.content, content?.button_text];

    return fields.some((field) => {
        const value = field?.[languageCode];
        return typeof value === "string" && value.trim() !== "";
    });
};

export const getErrorMessage = (error) => {
    const validationErrors = error?.response?.data?.errors;

    if (validationErrors && typeof validationErrors === "object") {
        return Object.values(validationErrors).flat().filter(Boolean).join(" ");
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again."
    );
};

export const extractListResponse = (response) => {
    const levels = [];
    let current = response;

    for (let depth = 0; depth < 5 && current != null; depth += 1) {
        if (Array.isArray(current)) {
            levels.push(current);
            break;
        }

        if (typeof current !== "object") {
            break;
        }

        levels.push(current);

        if (Array.isArray(current.items)) {
            levels.push(current.items);
            break;
        }

        if (!("data" in current)) {
            break;
        }

        current = current.data;
    }

    const records = levels.find(Array.isArray) ?? [];
    const paginationKeys = [
        "current_page",
        "last_page",
        "per_page",
        "total",
        "from",
        "to",
    ];
    const meta = {};

    levels.forEach((level) => {
        if (!level || typeof level !== "object" || Array.isArray(level)) {
            return;
        }

        paginationKeys.forEach((key) => {
            if (level[key] !== undefined && meta[key] === undefined) {
                meta[key] = level[key];
            }
        });

        if (level.meta && typeof level.meta === "object") {
            paginationKeys.forEach((key) => {
                if (level.meta[key] !== undefined && meta[key] === undefined) {
                    meta[key] = level.meta[key];
                }
            });
        }
    });

    return { records, meta };
};

export const formFromContent = (content, page, section) => ({
    page: content.page ?? page ?? "home",
    section: content.section ?? section ?? "",
    content_key: content.content_key ?? "",

    title: normalizeTranslations(content.title),
    subtitle: normalizeTranslations(content.subtitle),
    content: normalizeTranslations(content.content),
    button_text: normalizeTranslations(content.button_text),

    button_url: content.button_url ?? "",
    video_url: content.video_url ?? "",

    sort_order: Number(content.sort_order) || 0,
    is_active: Boolean(content.is_active),

    image: null,
    image_path: content.image_path ?? "",
    image_url: content.image_url ?? "",
    remove_image: false,

    existing_images: collectExistingImages(content),
    new_images: [],
    removed_image_paths: [],
});

const hasTranslationValue = (translations) =>
    Object.values(translations ?? {}).some(
        (value) => typeof value === "string" && value.trim() !== ""
    );

export const schemaUsesImagesField = (schema) =>
    (schema?.fields ?? []).some((field) => field.type === "images");

export const countRecordMedia = (record) => {
    if (Array.isArray(record?.image_urls) && record.image_urls.length > 0) {
        return record.image_urls.filter(Boolean).length;
    }

    const metadataImages = record?.metadata?.images;
    if (Array.isArray(metadataImages) && metadataImages.length > 0) {
        return metadataImages.filter(Boolean).length;
    }

    return record?.image_url || record?.image_path ? 1 : 0;
};

export const validateSectionForm = (form, schema, { isEdit = false } = {}) => {
    if (!form.page?.trim()) {
        return "Page is required.";
    }

    if (!form.section?.trim()) {
        return "Section is required.";
    }

    const requiredFields = (schema?.fields ?? []).filter((field) => field.required);

    for (const field of requiredFields) {
        if (!form.is_active && field.type !== "youtube") {
            continue;
        }
        if (field.type === "images") {
            if (countActiveImages(form) === 0 && !isEdit) {
                return `${field.label} is required.`;
            }
            continue;
        }

        if (field.type === "image") {
            const hasImage =
                Boolean(form.image) ||
                Boolean(form.image_url && !form.remove_image) ||
                getVisibleExistingImages(form).length > 0;

            if (!hasImage && !isEdit) {
                return `${field.label} is required.`;
            }
            continue;
        }

        if (field.type === "youtube") {
            const url = form.video_url?.trim() ?? "";

            if (form.is_active && !url) {
                return "A YouTube URL is required while this section is visible.";
            }

            if (url && !extractYouTubeId(url)) {
                return "Enter a valid YouTube watch, youtu.be, or embed URL.";
            }

            continue;
        }

        if (TRANSLATABLE_KEYS.has(field.key)) {
            const translations = form[field.key] ?? {};
            const hasValue =
                field.type === "editor"
                    ? Object.values(translations).some(
                          (value) => !isEmptyHtml(value)
                      )
                    : hasTranslationValue(translations);

            if (!hasValue) {
                return `${field.label} is required in at least one language.`;
            }

            const longest = Math.max(
                ...Object.values(translations).map((value) =>
                    field.type === "editor"
                        ? htmlToPlainText(value).length
                        : typeof value === "string"
                          ? value.trim().length
                          : 0
                )
            );

            if (field.key === "title" && longest > 160) {
                return "Heading must be 160 characters or fewer.";
            }

            if (field.key === "content" && field.type !== "editor" && longest > 600) {
                return "Description must be 600 characters or fewer.";
            }

            if (field.key === "content" && field.type === "editor" && longest > 4000) {
                return "Description must be 4000 characters or fewer.";
            }

            if (field.key === "subtitle" && longest > 80) {
                return "Eyebrow must be 80 characters or fewer.";
            }

            continue;
        }

        const value = form[field.key];

        if (typeof value !== "string" || !value.trim()) {
            return `${field.label} is required.`;
        }
    }

    const ctaUrl = form.button_url?.trim() ?? "";
    const hasCtaLabel = hasTranslationValue(form.button_text);
    const schemaHasCta = (schema?.fields ?? []).some(
        (field) => field.key === "button_url" || field.key === "button_text"
    );

    if (schemaHasCta && ctaUrl && !hasCtaLabel) {
        return "Add a CTA label when a CTA link is set.";
    }

    if (schemaHasCta && hasCtaLabel && !ctaUrl) {
        return "Add a CTA link when a CTA label is set.";
    }

    if (ctaUrl && !/^(https?:\/\/|\/)/i.test(ctaUrl)) {
        return "CTA link must start with / or http.";
    }

    const hasAnyContent =
        ["title", "subtitle", "content", "button_text"].some((key) =>
            hasTranslationValue(form[key])
        ) ||
        Boolean(form.image) ||
        countActiveImages(form) > 0 ||
        Boolean(form.button_url?.trim()) ||
        Boolean(form.video_url?.trim());

    if (!isEdit && !hasAnyContent) {
        return "Add at least one field before saving.";
    }

    return "";
};

export const buildSectionPayload = (form, schema, { isEdit = false } = {}) => {
    const payload = new FormData();
    const fieldKeys = new Set((schema?.fields ?? []).map((field) => field.key));

    const appendTranslations = (field, translations) => {
        const compact = Object.fromEntries(
            Object.entries(translations ?? {}).filter(
                ([, value]) => typeof value === "string" && value.trim() !== ""
            )
        );

        if (Object.keys(compact).length > 0) {
            payload.append(field, JSON.stringify(compact));
        } else if (isEdit) {
            payload.append(field, "null");
        }
    };

    payload.append("page", form.page.trim());
    payload.append("section", form.section.trim());

    let contentKey = slugifyKey(form.content_key);

    if (!contentKey) {
        if (schema?.mode !== "list") {
            contentKey = slugifyKey(form.section) || "item";
        } else {
            const seed =
                form.title?.en ||
                form.title?.ps ||
                form.title?.fa ||
                form.content?.en ||
                form.content?.ps ||
                form.content?.fa ||
                form.section;
            const baseKey = slugifyKey(seed) || `${slugifyKey(form.section) || "item"}`;
            contentKey = isEdit ? baseKey : `${baseKey}_${Date.now().toString(36)}`;
        }
    }

    payload.append("content_key", contentKey);

    if (fieldKeys.has("title")) appendTranslations("title", form.title);
    if (fieldKeys.has("subtitle")) appendTranslations("subtitle", form.subtitle);
    if (fieldKeys.has("content")) appendTranslations("content", form.content);
    if (fieldKeys.has("button_text")) appendTranslations("button_text", form.button_text);

    if (fieldKeys.has("button_url")) {
        payload.append("button_url", form.button_url?.trim() ?? "");
    }

    if (fieldKeys.has("video_url")) {
        payload.append("video_url", form.video_url?.trim() ?? "");
    }
    payload.append("sort_order", String(Number(form.sort_order) || 0));
    payload.append("is_active", form.is_active ? "1" : "0");

    if (fieldKeys.has("images")) {
        (form.new_images ?? []).forEach((entry) => {
            payload.append("images[]", entry.file);
        });

        payload.append(
            "removed_image_paths",
            JSON.stringify(form.removed_image_paths ?? [])
        );
    } else if (fieldKeys.has("image")) {
        payload.append("remove_image", form.remove_image ? "1" : "0");

        if (form.image) {
            payload.append("image", form.image);
        }
    }

    return payload;
};

export const buildBulkImagePayload = ({
    page,
    section,
    file,
    sortOrder = 0,
    title = createTranslations(),
    contentKey = "",
}) => {
    const payload = new FormData();

    payload.append("page", page);
    payload.append("section", section);
    payload.append(
        "content_key",
        slugifyKey(contentKey) ||
            `${slugifyKey(section) || "item"}_${slugifyKey(file.name) || "image"}_${Date.now()}`
    );
    payload.append("title", JSON.stringify(title));
    payload.append("sort_order", String(sortOrder));
    payload.append("is_active", "1");
    payload.append("image", file);

    return payload;
};

export const releaseNewImagePreviews = (entries = []) => {
    entries.forEach((entry) => {
        if (entry?.preview) {
            URL.revokeObjectURL(entry.preview);
        }
    });
};
