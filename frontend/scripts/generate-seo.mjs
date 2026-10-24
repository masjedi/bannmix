import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { getPublicSeo, PUBLIC_SEO, SITE_ORIGIN } from "../src/seo/publicSeo.js";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const indexPath = path.join(dist, "index.html");
const template = await readFile(indexPath, "utf8");

const escapeHtml = (value) =>
    value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

const renderHtml = (seo) => {
    const replacements = [
        [/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.title)}</title>`],
        [
            /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
            `<meta name="description" content="${escapeHtml(seo.description)}" />`,
        ],
        [
            /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
            `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
        ],
    ];

    return replacements.reduce((html, [pattern, replacement]) => {
        if (!pattern.test(html)) throw new Error(`Missing SEO tag: ${pattern}`);
        return html.replace(pattern, replacement);
    }, template);
};

for (const route of Object.keys(PUBLIC_SEO)) {
    const seo = getPublicSeo(route);
    const file = route === "/" ? "index.html" : `${route.slice(1)}.html`;
    await writeFile(path.join(dist, file), renderHtml(seo));
}

const urls = Object.keys(PUBLIC_SEO)
    .map((route) => `  <url><loc>${SITE_ORIGIN}${route}</loc></url>`)
    .join("\n");

await writeFile(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
