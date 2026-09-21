import { useEffect, useState } from "react";

import { Container, FadeUp, PageSection, SectionHeading } from "../ui";

const SLIDE_INTERVAL_MS = 5200;

const HomeTestimonialsCarousel = ({
    label,
    title,
    description,
    cues = [],
    items = [],
}) => {
    const quotes = items.filter(
        (item) => item?.quote?.trim() && item?.name?.trim()
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReduceMotion(media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    const quoteKey = quotes.map((item) => item.id ?? item.name).join("|");

    useEffect(() => {
        setActiveIndex(0);
    }, [quoteKey]);

    useEffect(() => {
        if (reduceMotion || paused || quotes.length <= 1) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % quotes.length);
        }, SLIDE_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [paused, quotes.length, reduceMotion]);

    if (quotes.length === 0) return null;

    const quoteMarkup = (item) => (
        <figure className="home-testimonials-quote">
            <span className="home-quote-mark" aria-hidden="true">
                “
            </span>
            <blockquote>
                <p className="home-quote-text">{item.quote}</p>
            </blockquote>
            <figcaption className="home-quote-source">{item.name}</figcaption>
        </figure>
    );

    const dots =
        quotes.length > 1 ? (
            <div className="home-quote-carousel-dots">
                {quotes.map((item, index) => (
                    <button
                        key={item.id ?? item.name}
                        type="button"
                        className={[
                            "home-quote-carousel-dot",
                            index === activeIndex ? "is-active" : "",
                        ].join(" ")}
                        aria-label={`${item.name}, ${index + 1} / ${quotes.length}`}
                        aria-current={
                            index === activeIndex ? "true" : undefined
                        }
                        onClick={() => setActiveIndex(index)}
                    />
                ))}
            </div>
        ) : null;

    return (
        <PageSection
            id="home-testimonials"
            border={false}
            className="home-testimonials home-section-compact"
        >
            <Container>
                <div className="home-testimonials-layout">
                    <FadeUp className="home-testimonials-copy">
                        <div className="home-testimonials-intro">
                            <SectionHeading
                                label={label}
                                title={title}
                            />
                            {description ? (
                                <p className="home-testimonials-lead">
                                    {description}
                                </p>
                            ) : null}
                            <div
                                className="home-testimonials-rule"
                                aria-hidden="true"
                            />
                            {cues.length > 0 ? (
                                <ul className="home-testimonials-cues">
                                    {cues.map((cue) => (
                                        <li key={cue}>{cue}</li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    </FadeUp>

                    <FadeUp delay={80} className="home-testimonials-panel">
                        {reduceMotion ? (
                            <ul className="home-testimonials-static">
                                {quotes.map((item) => (
                                    <li key={item.id ?? item.name}>
                                        {quoteMarkup(item)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div
                                className="home-quote-carousel"
                                role="region"
                                aria-roledescription="carousel"
                                aria-label={title}
                                onMouseEnter={() => setPaused(true)}
                                onMouseLeave={() => setPaused(false)}
                                onFocusCapture={() => setPaused(true)}
                                onBlurCapture={(event) => {
                                    if (
                                        !event.currentTarget.contains(
                                            event.relatedTarget
                                        )
                                    ) {
                                        setPaused(false);
                                    }
                                }}
                            >
                                <div
                                    className="home-quote-carousel-viewport"
                                    aria-live="polite"
                                >
                                    {quotes.map((item, index) => {
                                        const isActive = index === activeIndex;

                                        return (
                                            <div
                                                key={item.id ?? item.name}
                                                className={[
                                                    "home-quote-carousel-slide",
                                                    isActive ? "is-active" : "",
                                                ].join(" ")}
                                                aria-hidden={!isActive}
                                            >
                                                {quoteMarkup(item)}
                                            </div>
                                        );
                                    })}
                                </div>
                                {dots}
                            </div>
                        )}
                    </FadeUp>
                </div>
            </Container>
        </PageSection>
    );
};

export default HomeTestimonialsCarousel;
