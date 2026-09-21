export const LANGUAGE_OPTIONS = [
    { code: "en", label: "English", direction: "ltr" },
    { code: "ps", label: "پښتو", direction: "rtl" },
    { code: "fa", label: "دری", direction: "rtl" },
];

export const PAGE_LABELS = {
    home: "Home",
    about: "About Us",
    products: "Products Page",
    services: "Services",
    events: "Events",
    gallery: "Gallery",
    contact: "Contact Us",
    faq: "FAQ",
};

/** Pages edited from the Website Pages sidebar */
export const WEBSITE_PAGE_SLUGS = [
    "home",
    "about",
    "products",
    "services",
    "events",
    "gallery",
    "contact",
    "faq",
];

/** Page heroes that use a DataTable instead of a single form. */
export const DATATABLE_HERO_PAGES = [
    "home",
    "about",
    "products",
    "services",
    "gallery",
    "contact",
];

export const usesHeroDataTable = (page, section) =>
    DATATABLE_HERO_PAGES.includes(page) && section === "hero";

/** @typedef {'text' | 'textarea' | 'editor' | 'url' | 'youtube' | 'image' | 'images' | 'toggle'} FieldType */

/**
 * @typedef {Object} SectionField
 * @property {string} key
 * @property {string} label
 * @property {FieldType} type
 * @property {string} [hint]
 * @property {boolean} [required]
 * @property {number} [rows]
 */

/**
 * @typedef {Object} SectionSchema
 * @property {string} section
 * @property {string} label
 * @property {string} [description]
 * @property {'single' | 'list'} mode
 * @property {string} [itemLabel]
 * @property {boolean} [bulkImages]
 * @property {SectionField[]} fields
 */

/** Shared field presets */
const heroFields = [
    { key: "subtitle", label: "Eyebrow", type: "text", hint: "Small label above the title" },
    { key: "title", label: "Title", type: "text", required: true },
    { key: "content", label: "Description", type: "textarea", rows: 4 },
];

const heroWithCtaFields = [
    ...heroFields,
    { key: "button_text", label: "Button label", type: "text" },
    { key: "button_url", label: "Button link", type: "url", hint: "/products or https://…" },
    {
        key: "images",
        label: "Carousel images",
        type: "images",
        hint: "Add 2–5 photos for the hero slideshow.",
    },
];

const pageHeroFields = [
    ...heroFields,
    { key: "button_text", label: "Primary button label", type: "text" },
    { key: "button_url", label: "Primary button link", type: "url", hint: "/products or https://…" },
];

const sectionHeaderFields = [
    { key: "subtitle", label: "Section label", type: "text", hint: "Small label above the heading" },
    { key: "title", label: "Heading", type: "text", required: true },
    { key: "content", label: "Description", type: "textarea", rows: 3 },
];

const cardItemFields = [
    { key: "title", label: "Title", type: "text", required: true },
    { key: "content", label: "Description", type: "textarea", rows: 3 },
];

/** @type {Record<string, SectionSchema[]>} */
export const PAGE_SECTION_SCHEMAS = {
    home: [
        {
            section: "hero",
            label: "Hero",
            description: "Main headline and call to action at the top of the home page.",
            mode: "list",
            itemLabel: "Hero",
            fields: heroWithCtaFields,
        },
        {
            section: "trust_strip",
            label: "Trust Strip",
            description: "Short trust badges shown below the hero.",
            mode: "list",
            itemLabel: "Trust badge",
            fields: [{ key: "title", label: "Badge text", type: "text", required: true }],
        },
        {
            section: "majoon",
            label: "Our Majoon",
            description: "Product spotlight attributes shown in the Our Majoon grid.",
            mode: "list",
            itemLabel: "Attribute",
            fields: cardItemFields,
        },
        {
            section: "intro_video",
            label: "Intro Video",
            description:
                "YouTube introduction shown after Our Majoon. Turn off “Visible on the public website” to hide it. A valid YouTube URL is required while the section is visible.",
            mode: "single",
            fields: [
                {
                    key: "video_url",
                    label: "YouTube URL",
                    type: "youtube",
                    required: true,
                    hint: "youtube.com/watch, youtu.be, or /embed links only. Iframe HTML is not accepted.",
                },
                {
                    key: "image",
                    label: "Custom thumbnail",
                    type: "image",
                    hint: "Optional. If empty, the YouTube poster is used.",
                },
            ],
        },
        {
            section: "quality",
            label: "Quality & Ingredients",
            description: "Ingredient highlight cards shown in the quality grid.",
            mode: "list",
            itemLabel: "Ingredient",
            fields: cardItemFields,
        },
        {
            section: "quality_points",
            label: "Quality Points",
            description: "Numbered quality points shown below the ingredient cards.",
            mode: "list",
            itemLabel: "Quality point",
            fields: cardItemFields,
        },
        {
            section: "about_intro",
            label: "About Intro",
            description: "Short company introduction on the home page.",
            mode: "single",
            fields: [
                ...sectionHeaderFields,
                { key: "image", label: "Image", type: "image" },
            ],
        },
        {
            section: "about_intro_points",
            label: "About Intro Points",
            description: "Capability highlights shown beside the About Intro copy.",
            mode: "list",
            itemLabel: "Capability",
            fields: cardItemFields,
        },
        {
            section: "audience",
            label: "Who We Serve",
            description: "Audience groups you serve.",
            mode: "list",
            itemLabel: "Audience",
            fields: cardItemFields,
        },
        {
            section: "highlights",
            label: "Why BanMix",
            description: "Key strengths or selling points.",
            mode: "list",
            itemLabel: "Highlight",
            fields: cardItemFields,
        },
        {
            section: "ordering",
            label: "Ordering Process",
            description: "Steps for wholesale or retail ordering.",
            mode: "list",
            itemLabel: "Step",
            fields: cardItemFields,
        },
        {
            section: "distribution",
            label: "Distribution",
            description: "How products reach customers.",
            mode: "list",
            itemLabel: "Distribution point",
            fields: cardItemFields,
        },
        {
            section: "testimonials",
            label: "Testimonials",
            description: "Retailer quotes and feedback.",
            mode: "list",
            itemLabel: "Testimonial",
            fields: [
                { key: "content", label: "Quote", type: "textarea", rows: 4, required: true },
                { key: "subtitle", label: "Source", type: "text", hint: "e.g. Shopkeeper, Kabul" },
            ],
        },
        {
            section: "faq",
            label: "FAQ",
            description: "Frequently asked questions on the home page.",
            mode: "list",
            itemLabel: "Question",
            fields: [
                { key: "title", label: "Question", type: "text", required: true },
                { key: "content", label: "Answer", type: "textarea", rows: 4, required: true },
            ],
        },
    ],
    about: [
        {
            section: "hero",
            label: "Hero",
            description: "Top banner for the About page.",
            mode: "list",
            itemLabel: "Hero",
            fields: pageHeroFields,
        },
        {
            section: "story",
            label: "Our Story",
            description: "Company history block.",
            mode: "single",
            fields: [
                { key: "title", label: "Title", type: "text", required: true },
                { key: "content", label: "Story", type: "textarea", rows: 6 },
                { key: "image", label: "Image", type: "image" },
            ],
        },
        {
            section: "mission",
            label: "Mission",
            description: "Mission statement.",
            mode: "single",
            fields: [
                { key: "title", label: "Title", type: "text", required: true },
                { key: "content", label: "Mission", type: "textarea", rows: 4 },
            ],
        },
        {
            section: "vision",
            label: "Vision",
            description: "Vision statement.",
            mode: "single",
            fields: [
                { key: "title", label: "Title", type: "text", required: true },
                { key: "content", label: "Vision", type: "textarea", rows: 4 },
            ],
        },
        {
            section: "values",
            label: "Values",
            description: "Core company values.",
            mode: "list",
            itemLabel: "Value",
            fields: cardItemFields,
        },
        {
            section: "team",
            label: "Leadership Team",
            description: "Team member profiles.",
            mode: "list",
            itemLabel: "Team member",
            fields: [
                { key: "title", label: "Name", type: "text", required: true },
                { key: "subtitle", label: "Role", type: "text" },
                { key: "content", label: "Bio", type: "textarea", rows: 3 },
                { key: "image", label: "Photo", type: "image" },
            ],
        },
    ],
    services: [
        {
            section: "hero",
            label: "Hero",
            mode: "list",
            itemLabel: "Hero",
            fields: pageHeroFields,
        },
        {
            section: "intro",
            label: "Services Intro",
            description: "Heading above the services grid.",
            mode: "single",
            fields: [{ key: "title", label: "Heading", type: "text", required: true }],
        },
        {
            section: "items",
            label: "Services",
            description: "Individual service offerings.",
            mode: "list",
            itemLabel: "Service",
            fields: cardItemFields,
        },
    ],
    events: [
        {
            section: "hero",
            label: "Hero",
            mode: "single",
            fields: pageHeroFields,
        },
        {
            section: "intro",
            label: "Events Intro",
            mode: "single",
            fields: [{ key: "title", label: "Heading", type: "text", required: true }],
        },
        {
            section: "items",
            label: "Events",
            description: "Upcoming or past events.",
            mode: "list",
            itemLabel: "Event",
            fields: [
                { key: "title", label: "Title", type: "text", required: true },
                { key: "subtitle", label: "Date or category", type: "text" },
                { key: "content", label: "Description", type: "editor" },
                { key: "image", label: "Cover image", type: "image" },
            ],
        },
    ],
    gallery: [
        {
            section: "hero",
            label: "Hero",
            mode: "list",
            itemLabel: "Hero",
            fields: pageHeroFields,
        },
        {
            section: "intro",
            label: "Gallery Intro",
            mode: "single",
            fields: [{ key: "title", label: "Heading", type: "text", required: true }],
        },
        {
            section: "items",
            label: "Gallery Items",
            mode: "list",
            itemLabel: "Gallery item",
            fields: [
                { key: "title", label: "Title", type: "text", required: true },
                { key: "content", label: "Description", type: "textarea", rows: 2 },
                { key: "image", label: "Photo", type: "image", required: true },
            ],
        },
    ],
    contact: [
        {
            section: "hero",
            label: "Hero",
            mode: "list",
            itemLabel: "Hero",
            fields: heroFields,
        },
        {
            section: "location",
            label: "Location",
            description: "Office address and map details.",
            mode: "single",
            fields: [
                { key: "title", label: "Location name", type: "text" },
                { key: "subtitle", label: "City", type: "text" },
                { key: "content", label: "Address", type: "textarea", rows: 3 },
            ],
        },
    ],
    products: [
        {
            section: "hero",
            label: "Hero",
            description: "Page banner at the top of the products catalog.",
            mode: "list",
            itemLabel: "Hero",
            fields: pageHeroFields,
        },
    ],
    faq: [
        {
            section: "hero",
            label: "Hero",
            mode: "single",
            fields: heroFields,
        },
        {
            section: "items",
            label: "Questions",
            mode: "list",
            itemLabel: "Question",
            fields: [
                { key: "title", label: "Question", type: "text", required: true },
                { key: "content", label: "Answer", type: "textarea", rows: 4, required: true },
            ],
        },
    ],
};

export const getPageSections = (page) => {
    if (!page) return [];
    return PAGE_SECTION_SCHEMAS[page] ?? [];
};

export const isWebsitePageSlug = (page) =>
    Boolean(page && WEBSITE_PAGE_SLUGS.includes(page));

export const getWebsitePageSections = (page) => getPageSections(page);

export const getWebsitePageDefaultSection = (page) =>
    getWebsitePageSections(page)[0]?.section ?? "";

export const getSectionSchema = (page, section) => {
    if (!page || !section) return null;

    return (
        getPageSections(page).find(
            (entry) => entry.section === section
        ) ?? null
    );
};

export const getPageLabel = (page) => PAGE_LABELS[page] ?? page ?? "Page";

export const getFallbackSchema = () => ({
    section: "",
    label: "Content",
    description: "Basic content fields.",
    mode: "single",
    fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "text" },
        { key: "content", label: "Content", type: "textarea", rows: 4 },
        { key: "button_text", label: "Button label", type: "text" },
        { key: "button_url", label: "Button link", type: "url" },
        { key: "image", label: "Image", type: "image" },
    ],
});

export const resolveFormSchema = (page, section) => {
    return getSectionSchema(page, section) ?? getFallbackSchema();
};

/** Translation-backed form keys used by the CMS API */
export const TRANSLATABLE_KEYS = new Set([
    "title",
    "subtitle",
    "content",
    "button_text",
]);
