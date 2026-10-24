import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getPublicSeo } from "./publicSeo";

const PublicSeo = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const seo = getPublicSeo(pathname);
        if (!seo) return;

        document.title = seo.title;

        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement("meta");
            description.name = "description";
            document.head.appendChild(description);
        }
        description.content = seo.description;

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = seo.canonical;
    }, [pathname]);

    return null;
};

export default PublicSeo;
