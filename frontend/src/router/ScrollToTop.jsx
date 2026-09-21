import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const disableSmoothScroll = () => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
        root.style.scrollBehavior = previous;
    };
};

const resetWindowScroll = () => {
    const restore = disableSmoothScroll();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    restore();
};

const scrollToId = (hash) => {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    if (!id) return false;

    const element = document.getElementById(id);
    if (!element) return false;

    const restore = disableSmoothScroll();
    element.scrollIntoView({ behavior: "auto", block: "start" });
    restore();
    return true;
};

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useLayoutEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    useLayoutEffect(() => {
        if (hash) {
            if (scrollToId(hash)) return undefined;

            const timers = [50, 160, 400].map((delay) =>
                window.setTimeout(() => {
                    scrollToId(hash);
                }, delay)
            );

            return () => timers.forEach((timer) => window.clearTimeout(timer));
        }

        resetWindowScroll();
        const frame = window.requestAnimationFrame(resetWindowScroll);

        return () => window.cancelAnimationFrame(frame);
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
