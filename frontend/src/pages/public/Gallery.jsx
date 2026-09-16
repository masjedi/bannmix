import { Images, Leaf, Mountain, Sparkles } from "lucide-react";

import InnerPageHero from "../../components/public/InnerPageHero";
import {
    Container,
    PageSection,
    PublicCard,
    PublicPage,
    SectionHeading,
    SectionMark,
} from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations from "../../i18n/publicTranslations";

const FALLBACK_TILES = [
    {
        icon: Leaf,
        title: "Natural products",
        content: "Herbs, oils, foods, and wellness goods from the BanMix range.",
        tone: "from-white to-brand-orange/20 dark:from-theme-page dark:to-brand-orange/20",
    },
    {
        icon: Mountain,
        title: "Origin & place",
        content: "Landscapes and sourcing contexts behind our natural goods.",
        tone: "from-theme-surface to-theme-surface-soft",
    },
    {
        icon: Images,
        title: "Team & craft",
        content: "People and processes that bring BanMix products to partners.",
        tone: "from-brand-orange/10 to-white dark:from-brand-orange/10 dark:to-theme-page",
    },
    {
        icon: Sparkles,
        title: "Moments",
        content: "Showcases, gatherings, and everyday details from Kabul.",
        tone: "from-white to-brand-orange/15 dark:from-theme-page dark:to-brand-orange/15",
    },
];

const Gallery = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.gallery;
    const { error, getFirstSectionItem, getSection } =
        usePublicPageContent("gallery");

    const hero = getFirstSectionItem("hero");
    const intro = getFirstSectionItem("intro");
    const cmsItems = getSection("items");

    const tiles =
        cmsItems.length > 0
            ? cmsItems.map((item, index) => ({
                  icon: FALLBACK_TILES[index % FALLBACK_TILES.length].icon,
                  title:
                      item.title ||
                      FALLBACK_TILES[index % FALLBACK_TILES.length].title,
                  content:
                      item.content ||
                      item.description ||
                      FALLBACK_TILES[index % FALLBACK_TILES.length].content,
                  tone: FALLBACK_TILES[index % FALLBACK_TILES.length].tone,
                  image_url: item.image_url,
              }))
            : FALLBACK_TILES;

    return (
        <PublicPage>
            <InnerPageHero
                eyebrow={translate(t.heroLabel)}
                title={hero?.title || translate(t.heroTitle)}
                description={hero?.content || translate(t.heroBody)}
                primaryAction={{
                    label: translate(t.viewProducts),
                    to: "/products",
                }}
                secondaryAction={{
                    label: translate(t.backToHome),
                    to: "/",
                }}
            />

            <PageSection>
                <Container>
                    <SectionMark
                        index="02"
                        label={translate(t.highlightsLabel)}
                    />
                    <SectionHeading
                        title={intro?.title || translate(t.highlightsTitle)}
                        description={
                            intro?.content || translate(t.highlightsBody)
                        }
                    />

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {tiles.map((tile) => (
                            <PublicCard
                                key={tile.title}
                                hover
                                padding={false}
                                className="overflow-hidden"
                            >
                                <div
                                    className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${tile.tone}`}
                                >
                                    {tile.image_url ? (
                                        <img
                                            src={tile.image_url}
                                            alt={tile.title}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : (
                                        <tile.icon
                                            size={28}
                                            strokeWidth={1.75}
                                            className="text-brand-orange"
                                        />
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-base font-bold text-content text-content">
                                        {tile.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-6 text-content-secondary text-content-secondary">
                                        {tile.content}
                                    </p>
                                </div>
                            </PublicCard>
                        ))}
                    </div>
                </Container>
            </PageSection>

            {error ? (
                <p className="sr-only" role="status" aria-live="polite">
                    {error}
                </p>
            ) : null}
        </PublicPage>
    );
};

export default Gallery;
