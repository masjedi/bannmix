import { useMemo } from "react";

import ServicesGrid from "../../components/public/services/ServicesGrid";
import InnerPageHero from "../../components/public/InnerPageHero";
import { PublicPage } from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations from "../../i18n/publicTranslations";

const Services = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.services;
    const { error, getFirstSectionItem, getSection } =
        usePublicPageContent("services");

    const hero = getFirstSectionItem("hero");
    const intro = getFirstSectionItem("intro");
    const cmsItems = getSection("items");

    const items = useMemo(
        () =>
            cmsItems.map((item, index) => ({
                id: item.id ?? index,
                icon: item.icon,
                title: item.title || "",
                content: item.content || item.description || "",
            })),
        [cmsItems]
    );

    return (
        <PublicPage>
            {hero ? (
                <InnerPageHero
                    eyebrow={hero.subtitle || ""}
                    title={hero.title || ""}
                    description={hero.content || ""}
                    primaryAction={{
                        label: hero.button_text || "",
                        href: hero.button_url || "",
                    }}
                />
            ) : null}

            <ServicesGrid
                label={translate(t.offerLabel)}
                title={intro?.title || ""}
                items={items}
            />


            {error ? (
                <p className="sr-only" role="status" aria-live="polite">
                    {error}
                </p>
            ) : null}
        </PublicPage>
    );
};

export default Services;
