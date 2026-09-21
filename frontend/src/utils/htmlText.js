const ALLOWED_TAGS = new Set([
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "UL",
    "OL",
    "LI",
    "H2",
    "H3",
    "H4",
    "BLOCKQUOTE",
    "A",
    "DIV",
]);

const ALLOWED_ATTRS = {
    A: new Set(["href", "target", "rel"]),
};

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;

const unwrapElement = (element) => {
    const parent = element.parentNode;
    if (!parent) {
        element.remove();
        return;
    }

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }

    element.remove();
};

const sanitizeNode = (node) => {
    [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.COMMENT_NODE) {
            child.remove();
            return;
        }

        if (child.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const tag = child.tagName;

        if (!ALLOWED_TAGS.has(tag)) {
            sanitizeNode(child);
            unwrapElement(child);
            return;
        }

        [...child.attributes].forEach((attr) => {
            const allowed = ALLOWED_ATTRS[tag];
            if (!allowed || !allowed.has(attr.name.toLowerCase())) {
                child.removeAttribute(attr.name);
            }
        });

        if (tag === "A") {
            const href = child.getAttribute("href") || "";
            if (!SAFE_HREF.test(href)) {
                child.removeAttribute("href");
            }
            child.setAttribute("rel", "noopener noreferrer");
        }

        sanitizeNode(child);
    });
};

export const sanitizeHtml = (html = "") => {
    if (typeof html !== "string" || !html.trim()) {
        return "";
    }

    if (typeof DOMParser === "undefined") {
        return html;
    }

    const doc = new DOMParser().parseFromString(html, "text/html");
    sanitizeNode(doc.body);
    return doc.body.innerHTML.trim();
};

export const htmlToPlainText = (value = "") => {
    if (typeof value !== "string") {
        return "";
    }

    if (!/<[a-z][\s\S]*>/i.test(value)) {
        return value.replace(/\s+/g, " ").trim();
    }

    if (typeof DOMParser === "undefined") {
        return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    const doc = new DOMParser().parseFromString(value, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

export const isEmptyHtml = (value = "") => htmlToPlainText(value) === "";
