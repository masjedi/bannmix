import { Eye, Target } from "lucide-react";

import {
    Container,
    FadeUp,
    PageSection,
    PublicCard,
    SectionLabel,
} from "../ui";
import { hasText } from "./aboutUtils";

const InfoSideCard = ({ label, title, description, icon: Icon, className = "" }) => {
    if (!hasText(title) && !hasText(description)) return null;

    return (
        <PublicCard hover className={`flex h-full flex-col ${className}`}>
            <div className="flex items-start gap-3">
                {Icon ? (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-btn bg-brand-green/10 text-brand-green dark:bg-brand-green/20">
                        <Icon size={18} strokeWidth={1.75} />
                    </span>
                ) : null}
                <div className="min-w-0 flex-1">
                    {hasText(label) ? <SectionLabel>{label}</SectionLabel> : null}
                    {hasText(title) ? (
                        <h3
                            className={[
                                "text-xl font-extrabold tracking-tight text-content text-content sm:text-2xl",
                                hasText(label) ? "mt-2" : "",
                            ].join(" ")}
                        >
                            {title}
                        </h3>
                    ) : null}
                </div>
            </div>
            {hasText(description) ? (
                <p className="mt-4 break-words text-sm leading-7 text-content-secondary sm:text-base">
                    {description}
                </p>
            ) : null}
        </PublicCard>
    );
};

/**
 * Combined Story + Mission + Vision with adaptive layout based on available data.
 */
const StoryMissionVision = ({
    story,
    mission,
    vision,
    storyLabel,
    missionLabel,
    visionLabel,
}) => {
    const hasStory =
        hasText(story?.title) || hasText(story?.description) || hasText(story?.image);
    const hasMission = hasText(mission?.title) || hasText(mission?.description);
    const hasVision = hasText(vision?.title) || hasText(vision?.description);

    if (!hasStory && !hasMission && !hasVision) return null;

    const bothSides = hasStory && (hasMission || hasVision);
    const onlyMv = !hasStory && hasMission && hasVision;
    const onlyOneMv = !hasStory && ((hasMission && !hasVision) || (!hasMission && hasVision));

    return (
        <PageSection>
            <Container>
                <div
                    className={[
                        "grid gap-5",
                        bothSides ? "lg:grid-cols-[1.15fr_0.85fr] lg:gap-6" : "",
                        onlyMv ? "sm:grid-cols-2" : "",
                        onlyOneMv || (hasStory && !hasMission && !hasVision)
                            ? "grid-cols-1"
                            : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {hasStory ? (
                        <FadeUp>
                            <article className="public-card flex h-full min-w-0 flex-col p-6 sm:p-8">
                                {hasText(storyLabel) ? (
                                    <SectionLabel>{storyLabel}</SectionLabel>
                                ) : null}
                                {hasText(story?.title) ? (
                                    <h2
                                        className={[
                                            "max-w-xl text-[clamp(1.6rem,2.8vw,2.4rem)] font-extrabold leading-tight tracking-tight text-content text-content",
                                            hasText(storyLabel) ? "mt-3" : "",
                                        ].join(" ")}
                                    >
                                        {story.title}
                                    </h2>
                                ) : null}
                                {hasText(story?.description) ? (
                                    <p className="mt-5 max-w-2xl break-words text-base leading-8 text-content-secondary">
                                        {story.description}
                                    </p>
                                ) : null}
                                {hasText(story?.image) ? (
                                    <div className="home-hero-media mt-8 overflow-hidden p-2 sm:p-3">
                                        <img
                                            src={story.image}
                                            alt=""
                                            className="aspect-[16/10] w-full rounded-[16px] object-cover"
                                            onError={(event) => {
                                                event.currentTarget.parentElement?.remove();
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </article>
                        </FadeUp>
                    ) : null}

                    {(hasMission || hasVision) && (
                        <div
                            className={[
                                "grid gap-5",
                                bothSides && hasMission && hasVision
                                    ? "lg:grid-rows-2"
                                    : "",
                                !hasStory && hasMission && hasVision
                                    ? "sm:contents"
                                    : "",
                                bothSides || onlyOneMv ? "h-full" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {hasMission ? (
                                <FadeUp delay={60} className="h-full min-h-0">
                                    <InfoSideCard
                                        label={missionLabel}
                                        title={mission.title}
                                        description={mission.description}
                                        icon={Target}
                                        className="min-h-0"
                                    />
                                </FadeUp>
                            ) : null}
                            {hasVision ? (
                                <FadeUp delay={120} className="h-full min-h-0">
                                    <InfoSideCard
                                        label={visionLabel}
                                        title={vision.title}
                                        description={vision.description}
                                        icon={Eye}
                                        className="min-h-0"
                                    />
                                </FadeUp>
                            ) : null}
                        </div>
                    )}
                </div>
            </Container>
        </PageSection>
    );
};

export default StoryMissionVision;
