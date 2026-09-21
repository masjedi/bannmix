import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import HomeMediaFallback from "./home/HomeMediaFallback";

const SLIDE_INTERVAL_MS = 6800;
const SWIPE_THRESHOLD_PX = 48;

const padSlideNumber = (value) => String(value).padStart(2, "0");

const HomeHeroCarousel = ({
    slides = [],
    carouselLabel = "Product story carousel",
    prevLabel = "Previous slide",
    nextLabel = "Next slide",
    goToTemplate = "Go to slide {current} of {total}",
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [paused, setPaused] = useState(false);
    const touchStartXRef = useRef(null);

    const slideCount = slides.length;

    const goTo = useCallback(
        (index) => {
            if (slideCount === 0) return;
            setActiveIndex((index + slideCount) % slideCount);
            setPaused(true);
        },
        [slideCount]
    );

    const goPrev = useCallback(() => {
        goTo(activeIndex - 1);
    }, [activeIndex, goTo]);

    const goNext = useCallback(() => {
        goTo(activeIndex + 1);
    }, [activeIndex, goTo]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReduceMotion(media.matches);
        sync();
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        setActiveIndex(0);
        setPaused(false);
    }, [slideCount]);

    useEffect(() => {
        if (slideCount <= 1 || reduceMotion || paused) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % slideCount);
        }, SLIDE_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [paused, reduceMotion, slideCount]);

    const handleCarouselKeyDown = (event) => {
        if (slideCount <= 1) return;

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrev();
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
        }
    };

    if (slideCount === 0) {
        return null;
    }

    const formatGoToLabel = (index) =>
        goToTemplate
            .replace("{current}", String(index + 1))
            .replace("{total}", String(slideCount));

    const handleTouchStart = (event) => {
        touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event) => {
        const startX = touchStartXRef.current;
        const endX = event.changedTouches[0]?.clientX ?? null;
        touchStartXRef.current = null;

        if (startX == null || endX == null || slideCount <= 1) {
            return;
        }

        const delta = endX - startX;

        if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
            return;
        }

        if (delta > 0) {
            goPrev();
            return;
        }

        goNext();
    };

    return (
        <div className="home-hero-story">
            <div
                className="home-hero-carousel"
                role="region"
                aria-roledescription="carousel"
                aria-label={carouselLabel}
                tabIndex={0}
                onKeyDown={handleCarouselKeyDown}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setPaused(false);
                    }
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="home-hero-carousel-track" aria-live="polite">
                    {slides.map((slide, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <div
                                key={slide.id}
                                className={[
                                    "home-hero-carousel-slide",
                                    isActive ? "is-active" : "",
                                ].join(" ")}
                                aria-hidden={!isActive}
                            >
                                {slide.image ? (
                                    <img
                                        src={slide.image}
                                        alt={isActive ? slide.alt : ""}
                                        width={720}
                                        height={900}
                                        className="home-hero-carousel-image"
                                        fetchPriority={
                                            index === 0 ? "high" : undefined
                                        }
                                        loading={
                                            index === 0 ? "eager" : "lazy"
                                        }
                                        decoding={
                                            index === 0 ? "sync" : "async"
                                        }
                                        draggable={false}
                                    />
                                ) : (
                                    <HomeMediaFallback
                                        label={slide.fallbackLabel}
                                        className={[
                                            "home-hero-carousel-fallback",
                                            `home-hero-carousel-fallback--${slide.tone}`,
                                        ].join(" ")}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {slideCount > 1 ? (
                <div className="home-hero-carousel-controls">
                    <p
                        className="home-hero-carousel-count"
                        aria-live="polite"
                    >
                        <span className="home-hero-carousel-count-current">
                            {padSlideNumber(activeIndex + 1)}
                        </span>
                        <span
                            className="home-hero-carousel-count-sep"
                            aria-hidden="true"
                        >
                            /
                        </span>
                        <span
                            className="home-hero-carousel-count-total"
                            aria-hidden="true"
                        >
                            {padSlideNumber(slideCount)}
                        </span>
                    </p>

                    <div
                        className="home-hero-carousel-segments"
                        role="tablist"
                        aria-label={carouselLabel}
                    >
                        {slides.map((slide, index) => (
                            <button
                                key={`${slide.id}-segment`}
                                type="button"
                                role="tab"
                                className={[
                                    "home-hero-carousel-segment",
                                    index === activeIndex ? "is-active" : "",
                                ].join(" ")}
                                aria-selected={index === activeIndex}
                                aria-label={formatGoToLabel(index)}
                                onClick={() => goTo(index)}
                            />
                        ))}
                    </div>

                    <div className="home-hero-carousel-nav">
                        <button
                            type="button"
                            className="home-hero-carousel-nav-btn"
                            aria-label={prevLabel}
                            onClick={goPrev}
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="home-hero-carousel-nav-btn"
                            aria-label={nextLabel}
                            onClick={goNext}
                        >
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default HomeHeroCarousel;
