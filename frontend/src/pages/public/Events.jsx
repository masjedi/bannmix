import InnerPageHero from "../../components/public/InnerPageHero";
import {
    getEventDetailPath,
    normalizeEventItems,
} from "../../components/public/events/eventUtils";
import PostCard from "../../components/public/PostCard";
import {
    Container,
    FadeUp,
    PageSection,
    PublicPage,
    SectionHeading,
    SectionMark,
} from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations from "../../i18n/publicTranslations";

const Events = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.events;
    const { error, getFirstSectionItem, getSection } =
        usePublicPageContent("events");

    const hero = getFirstSectionItem("hero");
    const intro = getFirstSectionItem("intro");
    const items = normalizeEventItems(getSection("items"));

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

            {items.length > 0 ? (
                <PageSection>
                    <Container>
                        <SectionMark
                            index="02"
                            label={translate(t.comingUpLabel)}
                        />
                        <SectionHeading title={intro?.title || ""} />

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item, index) => (
                                <FadeUp
                                    key={getEventDetailPath(item)}
                                    delay={index * 70}
                                >
                                    <PostCard
                                        imageUrl={item.image_url}
                                        title={item.title}
                                        subtitle={item.subtitle}
                                        excerpt={item.excerpt}
                                        to={getEventDetailPath(item)}
                                        viewLabel={translate(t.viewEvent)}
                                        fallbackIcon={item.icon}
                                        tone={item.tone}
                                    />
                                </FadeUp>
                            ))}
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

export default Events;
