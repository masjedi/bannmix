import { ORDER_CONTACTS } from "../../../i18n/publicTranslations";

export const CATALOG_ID = "product-catalog";
export const WHOLESALE_ID = "wholesale-orders";

export const SORT_OPTIONS = [
    { value: "latest" },
    { value: "price_asc" },
    { value: "price_desc" },
    { value: "title_asc" },
    { value: "title_desc" },
    { value: "oldest" },
];

export const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    return true;
};

export const formatPrice = (product, priceOnRequest) => {
    if (!hasValue(product?.price)) {
        return priceOnRequest;
    }

    const amount = Number(product.price);

    if (Number.isNaN(amount)) {
        return priceOnRequest;
    }

    const formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    });

    const currency = String(product.currency || "").trim();

    if (!currency) {
        return formatted;
    }

    return `${currency} ${formatted}`;
};

export const whatsappOrder = (title, translate) => {
    const message = translate({
        en: `Hello BanMix, I want to order: ${title || "Majoon"}`,
        ps: `سلام BanMix، زه غواړم دا فرمایش ورکړم: ${title || "معجون"}`,
        fa: `سلام BanMix، می‌خواهم این را سفارش دهم: ${title || "معجون"}`,
    });

    return `https://wa.me/${ORDER_CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`;
};

export const wholesaleWhatsApp = (translate) => {
    const message = translate({
        en: "Hello BanMix, I would like wholesale pricing and distribution for my shop.",
        ps: "سلام BanMix، زه د خپل دوکان لپاره د عمده قیمت او ویش په اړه معلومات غواړم.",
        fa: "سلام BanMix، می‌خواهم قیمت عمده و توزیع برای فروشگاهم را دریافت کنم.",
    });

    return `https://wa.me/${ORDER_CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`;
};

export const getProductImage = (product) => {
    return product?.main_image_url || product?.gallery_image_urls?.[0] || "";
};

export const getProductImages = (product) => {
    const images = [
        product?.main_image_url,
        ...(Array.isArray(product?.gallery_image_urls)
            ? product.gallery_image_urls
            : []),
    ].filter(Boolean);

    return [...new Set(images)];
};

export const getMetadataChips = (product, translate) => {
    const chips = [];

    if (hasValue(product?.unit)) {
        chips.push({
            key: "unit",
            label: String(product.unit).trim(),
            tone: "neutral",
        });
    }

    if (hasValue(product?.moq)) {
        chips.push({
            key: "moq",
            label: `${translate({
                en: "MOQ",
                ps: "لږترلږه",
                fa: "حداقل",
            })} ${product.moq}`,
            tone: "neutral",
        });
    }

    const sample = product?.sample_available;
    if (sample === true || sample === 1 || /^yes$/i.test(String(sample || ""))) {
        chips.push({
            key: "sample",
            label: translate({
                en: "Samples",
                ps: "نمونې",
                fa: "نمونه",
            }),
            tone: "trust",
        });
    } else if (
        hasValue(sample) &&
        !/^(no|false|0)$/i.test(String(sample).trim())
    ) {
        chips.push({
            key: "sample",
            label: String(sample).trim(),
            tone: "trust",
        });
    }

    if (hasValue(product?.country_of_origin)) {
        const origin = String(product.country_of_origin).trim();
        const isLocal = /kabul|afghanistan/i.test(origin);
        chips.push({
            key: "origin",
            label: origin,
            tone: isLocal ? "trust" : "neutral",
        });
    }

    return chips;
};

export const getVisiblePages = (current, total) => {
    if (total <= 1) return [];
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages = [];
    const windowStart = Math.max(2, current - 1);
    const windowEnd = Math.min(total - 1, current + 1);

    pages.push(1);

    if (windowStart > 2) {
        pages.push("ellipsis-start");
    }

    for (let page = windowStart; page <= windowEnd; page += 1) {
        pages.push(page);
    }

    if (windowEnd < total - 1) {
        pages.push("ellipsis-end");
    }

    pages.push(total);

    return pages;
};
