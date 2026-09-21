import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";

import { excerptText, hasText } from "../../components/public/about/aboutUtils";
import {
    getEventDetailPath,
    normalizeEventItems,
    resolveEventByParam,
} from "../../components/public/events/eventUtils";
import InnerPageHero from "../../components/public/InnerPageHero";
import PostCard from "../../components/public/PostCard";
import { RichText } from "../../components/TextEditor";
import {
    ButtonLink,
    Container,
    FadeUp,
    PageSection,
    PublicPage,
    SectionLabel,
} from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations from "../../i18n/publicTranslations";

const EventDetails = () => {
    const { id } = useParams();
    const { translate } = useLanguage();
    const t = publicTranslations.events;
    const { error, getSection } = usePublicPageContent("events");

    const items = normalizeEventItems(getSection("items"));
    const event = resolveEventByParam(items, id);
    const relatedEvents = items
        .filter((item) => getEventDetailPath(item) !== getEventDetailPath(event))
        .slice(0, 3);

    const EventIcon = event?.icon;

    if (!event) {
        return (
            <PublicPage>
                <InnerPageHero
                    alignment="start"
                    eyebrow={translate(t.heroLabel)}
                    title={translate(t.notFoundTitle)}
                    description={translate(t.notFoundBody)}
                    primaryAction={{
                        label: translate(t.backToEvents),
                        to: "/events",
                    }}
                />
            </PublicPage>
        );
    }

    const heroDescription = excerptText(event.excerpt || event.content, 220);
    const showEventAction =
        hasText(event.button_text) && hasText(event.button_url);

    return (
        <PublicPage>
            <InnerPageHero
                alignment="start"
                eyebrow={event.subtitle || translate(t.heroLabel)}
                title={event.title}
                description={heroDescription}
                primaryAction={
                    showEventAction
                        ? event.button_url.startsWith("http")
                            ? {
                                  label: event.button_text,
                                  href: event.button_url,
                              }
                            : {
                                  label: event.button_text,
                                  to: event.button_url,
                              }
                        : undefined
                }
                secondaryAction={{
                    label: translate(t.backToEvents),
                    to: "/events",
                }}
            />

            <PageSection border={false} id="content">
                <Container>
                    <div className="event-detail-layout">
                        <FadeUp delay={80} className="event-detail-media">
                            <div className="event-detail-media-frame">
                                {event.image_url ? (
                                    <img
                                        src={event.image_url}
                                        alt={event.title}
                                        className="event-detail-media-image"
                                    />
                                ) : EventIcon ? (
                                    <div className="event-detail-media-fallback">
                                        <EventIcon
                                            size={40}
                                            strokeWidth={1.75}
                                            className="text-brand-orange"
                                            aria-hidden="true"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </FadeUp>

                        <FadeUp delay={120} className="event-detail-copy">
                            {event.content ? (
                                <RichText
                                    html={event.content}
                                    className="event-detail-body text-sm leading-7 text-content-secondary sm:text-base"
                                />
                            ) : null}

                            {showEventAction ? (
                                <ButtonLink
                                    {...(event.button_url.startsWith("http")
                                        ? {
                                              href: event.button_url,
                                              external: true,
                                          }
                                        : { to: event.button_url })}
                                    className="mt-6"
                                >
                                    {event.button_text}
                                    <ArrowRight
                                        size={16}
                                        className="rtl:rotate-180"
                                        aria-hidden="true"
                                    />
                                </ButtonLink>
                            ) : null}
                        </FadeUp>
                    </div>
                </Container>
            </PageSection>

            {relatedEvents.length > 0 ? (
                <PageSection border={false} className="home-section-soft">
                    <Container>
                        <FadeUp>
                            <SectionLabel>{translate(t.heroLabel)}</SectionLabel>
                            <h2 className="mt-3 text-2xl font-bold text-content">
                                {translate(t.relatedTitle)}
                            </h2>
                        </FadeUp>

                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedEvents.map((item, index) => (
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

export default EventDetails;
