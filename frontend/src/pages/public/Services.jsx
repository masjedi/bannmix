import { useMemo } from "react";

import ServicesGrid from "../../components/public/services/ServicesGrid";
import InnerPageHero from "../../components/public/InnerPageHero";
import ProductsCtaSection from "../../components/public/ProductsCtaSection";
import { PublicPage } from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations, {
    ORDER_CONTACTS,
    SERVICES_ITEMS,
} from "../../i18n/publicTranslations";

const Services = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.services;
    const { error, getFirstSectionItem, getSection } =
        usePublicPageContent("services");

    const hero = getFirstSectionItem("hero");
    const intro = getFirstSectionItem("intro");
    const cmsItems = getSection("items");

    const items = useMemo(() => {
        const fallback = SERVICES_ITEMS.map((item, index) => ({
            id: item.icon ?? index,
            icon: item.icon,
            title: translate(item.title),
            content: translate(item.content),
        }));

        if (cmsItems.length === 0) return fallback;

        return cmsItems.map((item, index) => ({
            id: item.id ?? index,
            icon: item.icon ?? SERVICES_ITEMS[index]?.icon,
            title:
                item.title ||
                fallback[index % fallback.length]?.title ||
                "",
            content:
                item.content ||
                item.description ||
                fallback[index % fallback.length]?.content ||
                "",
        }));
    }, [cmsItems, translate]);

    return (
        <PublicPage>
            <InnerPageHero
                eyebrow={translate(t.heroLabel)}
                title={hero?.title || translate(t.heroTitle)}
                description={hero?.content || translate(t.heroBody)}
                primaryAction={{
                    label: translate(t.browseProducts),
                    to: "/products",
                }}
                secondaryAction={{
                    label: translate(t.backToHome),
                    to: "/",
                }}
            />

            <ServicesGrid
                label={translate(t.offerLabel)}
                title={intro?.title || translate(t.offerTitle)}
                description={intro?.content || translate(t.offerBody)}
                items={items}
            />

            <ProductsCtaSection
                label={translate(t.ctaLabel)}
                title={translate(t.ctaTitle)}
                description={translate(t.ctaBody)}
                primaryCtaText={translate(t.viewProducts)}
                primaryCtaUrl="/products"
                secondaryCtaText={translate(t.contactUs)}
                secondaryCtaUrl={ORDER_CONTACTS.phoneHref}
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
