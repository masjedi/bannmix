import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { PublicCard } from "./ui";

const PostCard = ({
    imageUrl,
    title,
    subtitle,
    excerpt,
    to,
    viewLabel,
    fallbackIcon: FallbackIcon,
    tone = "from-theme-surface to-theme-surface-soft",
    className = "",
}) => {
    const hasImage = Boolean(imageUrl?.trim());
    const hasSubtitle = Boolean(subtitle?.trim());
    const hasExcerpt = Boolean(excerpt?.trim());
    const hasLink = Boolean(to?.trim());
    const imageAlt = title?.trim() || "Post image";

    const media = (
        <div
            className={[
                "relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br",
                tone,
            ].join(" ")}
        >
            {hasImage ? (
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-premium group-hover:scale-[1.03]"
                />
            ) : FallbackIcon ? (
                <FallbackIcon
                    size={28}
                    strokeWidth={1.75}
                    className="text-brand-orange transition duration-300 group-hover:scale-110"
                    aria-hidden="true"
                />
            ) : null}
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                aria-hidden="true"
            />
        </div>
    );

    const titleNode = hasLink ? (
        <Link to={to} className="post-card-title-link">
            {title}
        </Link>
    ) : (
        title
    );

    return (
        <PublicCard
            hover
            padding={false}
            className={[
                "post-card group flex h-full flex-col overflow-hidden",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {hasLink ? (
                <Link to={to} className="post-card-media-link block">
                    {media}
                </Link>
            ) : (
                media
            )}

            <div className="post-card-body">
                {hasSubtitle ? (
                    <p className="post-card-eyebrow">{subtitle}</p>
                ) : null}

                <h3
                    className={[
                        "post-card-title",
                        hasSubtitle ? "mt-2" : "",
                    ].join(" ")}
                >
                    {titleNode}
                </h3>

                {hasExcerpt ? (
                    <p className="post-card-excerpt">{excerpt}</p>
                ) : null}

                {hasLink && viewLabel ? (
                    <Link to={to} className="post-card-view">
                        {viewLabel}
                        <ArrowRight
                            size={14}
                            className="post-card-view-arrow rtl:rotate-180"
                            aria-hidden="true"
                        />
                    </Link>
                ) : null}
            </div>
        </PublicCard>
    );
};

export default PostCard;
