export const isTelHref = (href) =>
    typeof href === "string" && href.trim().toLowerCase().startsWith("tel:");

export const isMailHref = (href) =>
    typeof href === "string" && href.trim().toLowerCase().startsWith("mailto:");

export const needsPlainTextDirection = (href) =>
    isTelHref(href) || isMailHref(href);

export const bidiPlainTextClassName = "type-bidi-plain";
