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

const GALLERY_ICONS = [Leaf, Mountain, Images, Sparkles];
const GALLERY_TONES = [
    "from-white to-brand-orange/20 dark:from-theme-page dark:to-brand-orange/20",
    "from-theme-surface to-theme-surface-soft",
    "from-brand-orange/10 to-white dark:from-brand-orange/10 dark:to-theme-page",
    "from-white to-brand-orange/15 dark:from-theme-page dark:to-brand-orange/15",
];

const Gallery = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.gallery;
    const { error, getFirstSectionItem, getSection } =
        usePublicPageContent("gallery");

    const hero = getFirstSectionItem("hero");
    const intro = getFirstSectionItem("intro");
    const tiles = getSection("items").map((item, index) => ({
        id: item.id ?? index,
        icon: GALLERY_ICONS[index % GALLERY_ICONS.length],
        title: item.title || "",
        content: item.content || item.description || "",
        tone: GALLERY_TONES[index % GALLERY_TONES.length],
        image_url: item.image_url || "",
    }));

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

            {tiles.length > 0 ? (
                <PageSection>
                    <Container>
                        <SectionMark
                            index="02"
                            label={translate(t.highlightsLabel)}
                        />
                        <SectionHeading title={intro?.title || ""} />

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {tiles.map((tile) => {
                                const Icon = tile.icon;

                                return (
                                    <PublicCard
                                        key={tile.id}
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
                                                <Icon
                                                    size={28}
                                                    strokeWidth={1.75}
                                                    className="text-brand-orange"
                                                />
                                            )}
                                        </div>
                                        <div className="p-5">
                                            {tile.title ? (
                                                <h3 className="text-base font-bold text-content">
                                                    {tile.title}
                                                </h3>
                                            ) : null}
                                            {tile.content ? (
                                                <p className="mt-1.5 text-sm leading-6 text-content-secondary">
                                                    {tile.content}
                                                </p>
                                            ) : null}
                                        </div>
                                    </PublicCard>
                                );
                            })}
                        </div>
                    </Container>
                </PageSection>
            ) : null}

            {error ? (
                <p className="sr-only" role="status" aria-live="polite">
                    {error}
                </p>
            ) : null}
        </PublicPage>
    );
};

export default Gallery;
