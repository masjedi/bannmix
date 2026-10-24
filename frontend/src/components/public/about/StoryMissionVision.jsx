import { useState } from "react";

import { Eye, Target } from "lucide-react";

import { Container, FadeUp, PageSection, SectionLabel } from "../ui";
import { hasText } from "./aboutUtils";

const storyParagraphs = (value) => {
    if (!hasText(value)) return [];

    return value.trim().split(/\r?\n+/).map((part) => part.trim()).filter(Boolean).flatMap((part) => {
        if (part.length <= 320 || typeof Intl.Segmenter !== "function") {
            return [part];
        }

        const sentences = Array.from(
            new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(part),
            ({ segment }) => segment.trim()
        ).filter(Boolean);
        const paragraphs = [];
        let current = "";

        for (const sentence of sentences) {
            if (current && current.length + sentence.length > 320) {
                paragraphs.push(current);
                current = sentence;
            } else {
                current = current ? `${current} ${sentence}` : sentence;
            }
        }

        if (current) paragraphs.push(current);
        return paragraphs;
    });
};

const InfoSideCard = ({ label, title, description, icon: Icon }) => {
    if (!hasText(title) && !hasText(description)) return null;
    const showLabel = hasText(label) &&
        label.trim().toLocaleLowerCase() !== title?.trim().toLocaleLowerCase();

    return (
        <article className="about-principle-card">
            <div className="about-principle-heading">
                <span className="about-principle-icon" aria-hidden="true">
                    <Icon size={19} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                    {showLabel ? <SectionLabel>{label}</SectionLabel> : null}
                    {hasText(title) ? <h3 className="about-principle-title">{title}</h3> : null}
                </div>
            </div>
            {hasText(description) ? (
                <p className="about-principle-description">{description}</p>
            ) : null}
        </article>
    );
};

const StoryMissionVision = ({
    story,
    mission,
    vision,
    storyLabel,
    missionLabel,
    visionLabel,
}) => {
    const [failedImage, setFailedImage] = useState("");
    const paragraphs = storyParagraphs(story?.description);
    const [leadParagraph, ...remainingParagraphs] = paragraphs;
    const hasStory =
        hasText(story?.title) || paragraphs.length > 0 || hasText(story?.image);
    const hasMission = hasText(mission?.title) || hasText(mission?.description);
    const hasVision = hasText(vision?.title) || hasText(vision?.description);
    const showImage = hasText(story?.image) && failedImage !== story.image;

    if (!hasStory && !hasMission && !hasVision) return null;

    return (
        <PageSection pad={false} border={false} className="about-story-section">
            <Container>
                {hasStory ? (
                    <>
                        <div className={`about-story-intro ${showImage ? "" : "is-text-only"}`}>
                            <FadeUp className="about-story-heading">
                                {hasText(storyLabel) ? (
                                    <SectionLabel className="about-story-label">{storyLabel}</SectionLabel>
                                ) : null}
                                {hasText(story?.title) ? (
                                    <h2 className="about-story-title">{story.title}</h2>
                                ) : null}
                                {leadParagraph ? (
                                    <p className="about-story-lead">{leadParagraph}</p>
                                ) : null}
                            </FadeUp>

                            {showImage ? (
                                <FadeUp delay={80}>
                                    <figure className="about-story-image-wrap">
                                        <img
                                            src={story.image}
                                            alt=""
                                            loading="lazy"
                                            width={800}
                                            height={600}
                                            className="about-story-image"
                                            onError={() => setFailedImage(story.image)}
                                        />
                                    </figure>
                                </FadeUp>
                            ) : null}
                        </div>

                        {remainingParagraphs.length > 0 ? (
                            <FadeUp delay={100} className="about-story-body">
                                {remainingParagraphs.map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </FadeUp>
                        ) : null}
                    </>
                ) : null}

                {hasMission || hasVision ? (
                    <div className={`about-principles ${hasStory ? "has-story" : ""} ${hasMission && hasVision ? "" : "is-single"}`}>
                        {hasMission ? (
                            <FadeUp delay={60}>
                                <InfoSideCard
                                    label={missionLabel}
                                    title={mission.title}
                                    description={mission.description}
                                    icon={Target}
                                />
                            </FadeUp>
                        ) : null}
                        {hasVision ? (
                            <FadeUp delay={120}>
                                <InfoSideCard
                                    label={visionLabel}
                                    title={vision.title}
                                    description={vision.description}
                                    icon={Eye}
                                />
                            </FadeUp>
                        ) : null}
                    </div>
                ) : null}
            </Container>
        </PageSection>
    );
};

export default StoryMissionVision;
