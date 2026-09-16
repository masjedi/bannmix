import { ArrowRight, ChevronDown } from "lucide-react";

import { Link } from "react-router-dom";

import { hasText, isExternalUrl } from "./about/aboutUtils";
import { ButtonLink, Container, PageSection } from "./ui";

const resolveTarget = (action) =>
    action?.href || action?.to || action?.url || "";

const isHashLink = (target) => target.startsWith("#");

const PrimaryAction = ({ action }) => {
    const target = resolveTarget(action);
    if (!hasText(action?.label) || !hasText(target)) return null;

    const icon = isHashLink(target) ? (
        <ChevronDown size={16} aria-hidden="true" />
    ) : (
        <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
    );

    if (isHashLink(target) || isExternalUrl(target)) {
        return (
            <a href={target} className="btn-primary inner-page-hero-primary">
                {action.label}
                {icon}
            </a>
        );
    }

    return (
        <ButtonLink to={target} className="inner-page-hero-primary">
            {action.label}
            {icon}
        </ButtonLink>
    );
};

const SecondaryAction = ({ action }) => {
    const target = resolveTarget(action);
    if (!hasText(action?.label) || !hasText(target)) return null;

    const content = (
        <>
            {action.label}
            <ArrowRight
                size={15}
                aria-hidden="true"
                className="inner-page-hero-secondary-arrow rtl:rotate-180"
            />
        </>
    );

    if (isHashLink(target) || isExternalUrl(target)) {
        return (
            <a href={target} className="inner-page-hero-secondary">
                {content}
            </a>
        );
    }

    return (
        <Link to={target} className="inner-page-hero-secondary">
            {content}
        </Link>
    );
};

const InnerPageHero = ({
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
    alignment = "center",
    showActions = true,
    showScrollIndicator = false,
    scrollTarget = "#content",
}) => {
    if (!hasText(title) && !hasText(description) && !hasText(eyebrow)) {
        return null;
    }

    const showPrimary =
        showActions &&
        hasText(primaryAction?.label) &&
        hasText(resolveTarget(primaryAction));
    const showSecondary =
        showActions &&
        hasText(secondaryAction?.label) &&
        hasText(resolveTarget(secondaryAction));

    return (
        <PageSection
            pad={false}
            className={[
                "inner-page-hero",
                alignment === "center" ? "is-centered" : "is-start",
            ].join(" ")}
        >
            <div className="inner-page-hero-atmosphere" aria-hidden="true">
                <span className="inner-page-hero-glow inner-page-hero-glow--green" />
                <span className="inner-page-hero-glow inner-page-hero-glow--orange" />
                <span className="inner-page-hero-glow inner-page-hero-glow--blue" />
            </div>

            <Container className="inner-page-hero-container">
                <div className="inner-page-hero-content">
                    {hasText(eyebrow) ? (
                        <p className="inner-page-hero-eyebrow inner-page-hero-enter inner-page-hero-enter--1">
                            <span
                                className="inner-page-hero-eyebrow-mark"
                                aria-hidden="true"
                            />
                            <span>{eyebrow}</span>
                            <span
                                className="inner-page-hero-eyebrow-mark"
                                aria-hidden="true"
                            />
                        </p>
                    ) : null}

                    {hasText(title) ? (
                        <h1
                            className={[
                                "inner-page-hero-title inner-page-hero-enter inner-page-hero-enter--2",
                                hasText(eyebrow) ? "mt-3 sm:mt-4" : "",
                            ].join(" ")}
                        >
                            {title}
                        </h1>
                    ) : null}

                    {hasText(description) ? (
                        <p
                            className={[
                                "inner-page-hero-description inner-page-hero-enter inner-page-hero-enter--3",
                                "mt-4 sm:mt-5",
                            ].join(" ")}
                        >
                            {description}
                        </p>
                    ) : null}

                    {showPrimary || showSecondary ? (
                        <div className="inner-page-hero-actions inner-page-hero-enter inner-page-hero-enter--4 mt-6 sm:mt-7">
                            {showPrimary ? (
                                <PrimaryAction action={primaryAction} />
                            ) : null}
                            {showSecondary ? (
                                <SecondaryAction action={secondaryAction} />
                            ) : null}
                        </div>
                    ) : null}

                    {showScrollIndicator ? (
                        <a
                            href={scrollTarget}
                            className="inner-page-hero-scroll inner-page-hero-enter inner-page-hero-enter--5"
                            aria-label="Scroll to content"
                        >
                            <ChevronDown size={18} aria-hidden="true" />
                        </a>
                    ) : null}
                </div>
            </Container>
        </PageSection>
    );
};

export default InnerPageHero;
