import { CalendarDays, MapPin, Users } from "lucide-react";

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

const FALLBACK_EVENTS = [
    {
        icon: CalendarDays,
        title: "Product showcases",
        content:
            "Seasonal showcases where partners and visitors can see BanMix natural products up close.",
    },
    {
        icon: MapPin,
        title: "Local gatherings in Kabul",
        content:
            "Community and trade events that connect BanMix with retailers, distributors, and customers in Afghanistan.",
    },
    {
        icon: Users,
        title: "Partner meetings",
        content:
            "Focused sessions for businesses exploring collaboration, supply planning, and product introductions.",
    },
];

const Events = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.events;
    const { error, getFirstSectionItem, getSection } =
        usePublicPageContent("events");

    const hero = getFirstSectionItem("hero");
    const intro = getFirstSectionItem("intro");
    const cmsItems = getSection("items");

    const items =
        cmsItems.length > 0
            ? cmsItems.map((item, index) => ({
                  icon: FALLBACK_EVENTS[index % FALLBACK_EVENTS.length].icon,
                  title:
                      item.title ||
                      FALLBACK_EVENTS[index % FALLBACK_EVENTS.length].title,
                  content:
                      item.content ||
                      item.description ||
                      FALLBACK_EVENTS[index % FALLBACK_EVENTS.length].content,
              }))
            : FALLBACK_EVENTS;

    return (
        <PublicPage>
            <InnerPageHero
                eyebrow={translate(t.heroLabel)}
                title={hero?.title || translate(t.heroTitle)}
                description={hero?.content || translate(t.heroBody)}
                primaryAction={{
                    label: translate(t.exploreProducts),
                    to: "/products",
                }}
                secondaryAction={{
                    label: translate(t.backToHome),
                    to: "/",
                }}
            />

            <PageSection>
                <Container>
                    <SectionMark index="02" label={translate(t.comingUpLabel)} />
                    <SectionHeading
                        title={intro?.title || translate(t.comingUpTitle)}
                        description={
                            intro?.content || translate(t.comingUpBody)
                        }
                    />

                    <div className="mt-12 grid gap-5 sm:grid-cols-3">
                        {items.map((item) => (
                            <PublicCard key={item.title} hover className="h-full">
                                <span className="grid h-11 w-11 place-items-center rounded-btn bg-brand-orange/10 text-brand-orange">
                                    <item.icon size={19} strokeWidth={1.75} />
                                </span>
                                <h3 className="mt-5 text-lg font-bold text-content text-content">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-content-secondary text-content-secondary">
                                    {item.content}
                                </p>
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

export default Events;
