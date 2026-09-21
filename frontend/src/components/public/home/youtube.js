const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "youtube-nocookie.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
]);

export const extractYouTubeId = (value) => {
    const raw = String(value ?? "").trim();

    if (!raw || /[<>]/.test(raw)) {
        return "";
    }

    try {
        const url = new URL(raw);
        const host = url.hostname.replace(/^www\./, "").toLowerCase();

        if (!YOUTUBE_HOSTS.has(host)) {
            return "";
        }

        if (host === "youtu.be") {
            const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
            return YOUTUBE_ID_PATTERN.test(id) ? id : "";
        }

        if (url.pathname === "/watch") {
            const id = url.searchParams.get("v") ?? "";
            return YOUTUBE_ID_PATTERN.test(id) ? id : "";
        }

        const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})\/?$/);
        if (embedMatch) {
            return embedMatch[1];
        }

        const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})\/?$/);
        if (shortsMatch) {
            return shortsMatch[1];
        }
    } catch {
        return "";
    }

    return "";
};

export const youtubeThumbnailUrl = (videoId) =>
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const youtubeEmbedUrl = (videoId) =>
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
