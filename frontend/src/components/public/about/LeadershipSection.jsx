import { useState } from "react";

import { Link } from "react-router-dom";

import { Mail } from "lucide-react";

import { Container, FadeUp, PageSection } from "../ui";
import { getInitials, hasText, isExternalUrl, teamGridClass } from "./aboutUtils";

const LinkedInIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const InstagramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.849s-.012 3.584-.069 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.012-4.849-.069c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072c-1.281.058-2.156.246-2.921.525a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .622 4.131C.343 4.896.155 5.771.097 7.052.039 8.332.025 8.741.025 12s.014 3.668.072 4.948c.058 1.281.246 2.156.525 2.921a5.88 5.88 0 0 0 1.384 2.126 5.88 5.88 0 0 0 2.126 1.384c.765.279 1.64.467 2.921.525C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.281-.058 2.156-.246 2.921-.525a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.279-.765.467-1.64.525-2.921.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.058-1.281-.246-2.156-.525-2.921a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.869.622c-.765-.279-1.64-.467-2.921-.525C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
);

const XIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TeamAvatar = ({ name, image }) => {
    const [failed, setFailed] = useState(false);
    const showImage = hasText(image) && !failed;

    return (
        <div className="about-team-avatar">
            {showImage ? (
                <img
                    src={image}
                    alt={name || ""}
                    className="about-team-avatar-image"
                    onError={() => setFailed(true)}
                />
            ) : (
                <span className="about-team-avatar-fallback">
                    {getInitials(name)}
                </span>
            )}
        </div>
    );
};

const SocialLinks = ({
    linkedin_url,
    facebook_url,
    instagram_url,
    twitter_url,
    email,
}) => {
    const links = [
        facebook_url
            ? { href: facebook_url, label: "Facebook", Icon: FacebookIcon }
            : null,
        instagram_url
            ? { href: instagram_url, label: "Instagram", Icon: InstagramIcon }
            : null,
        twitter_url ? { href: twitter_url, label: "X", Icon: XIcon } : null,
        linkedin_url
            ? { href: linkedin_url, label: "LinkedIn", Icon: LinkedInIcon }
            : null,
        email ? { href: `mailto:${email}`, label: "Email", Icon: Mail } : null,
    ].filter(Boolean);

    if (links.length === 0) return null;

    return (
        <div className="about-team-social">
            {links.map((link) => (
                <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={
                        link.href.startsWith("mailto:")
                            ? undefined
                            : "noreferrer noopener"
                    }
                    className="about-team-social-link"
                >
                    {link.label === "Email" ? (
                        <Mail size={15} strokeWidth={2} />
                    ) : (
                        <link.Icon className="h-[0.95rem] w-[0.95rem]" />
                    )}
                </a>
            ))}
        </div>
    );
};

const TeamMemberCard = ({ member }) => (
    <article className="about-team-card group">
        <div className="about-team-card-header" aria-hidden="true" />

        <div className="about-team-card-body">
            <div className="about-team-avatar-shell">
                <TeamAvatar name={member.name} image={member.image} />
            </div>

            <h3 className="about-team-name">{member.name}</h3>

            {hasText(member.position) ? (
                <p className="about-team-role">{member.position}</p>
            ) : null}

            {hasText(member.description) ? (
                <p className="about-team-bio">{member.description}</p>
            ) : null}

            <SocialLinks
                linkedin_url={member.linkedin_url}
                facebook_url={member.facebook_url}
                instagram_url={member.instagram_url}
                twitter_url={member.twitter_url}
                email={member.email}
            />
        </div>

        <div className="about-team-card-footer" aria-hidden="true" />
    </article>
);

const TeamCta = ({ text, url, variant = "primary" }) => {
    if (!hasText(text) || !hasText(url)) return null;

    const className =
        variant === "outline"
            ? "about-team-cta about-team-cta-outline"
            : "about-team-cta about-team-cta-solid";

    if (isExternalUrl(url) || url.startsWith("#")) {
        return (
            <a href={url} className={className}>
                {text}
            </a>
        );
    }

    return (
        <Link to={url} className={className}>
            {text}
        </Link>
    );
};

const LeadershipSection = ({
    label,
    title,
    description,
    team = [],
    primaryCtaText,
    primaryCtaUrl,
    secondaryCtaText,
    secondaryCtaUrl,
}) => {
    const members = (Array.isArray(team) ? team : []).filter((member) =>
        hasText(member?.name)
    );

    if (members.length === 0) return null;

    const hasCtas =
        (hasText(primaryCtaText) && hasText(primaryCtaUrl)) ||
        (hasText(secondaryCtaText) && hasText(secondaryCtaUrl));

    return (
        <PageSection border={false} className="about-team-section">
            <Container>
                <FadeUp>
                    <div className="about-team-header mx-auto max-w-2xl text-center">
                        {hasText(label) ? (
                            <p className="about-team-badge">{label}</p>
                        ) : null}

                        {hasText(title) ? (
                            <h2
                                className={[
                                    "about-team-title",
                                    hasText(label) ? "mt-4" : "",
                                ].join(" ")}
                            >
                                {title}
                            </h2>
                        ) : null}

                        {hasText(description) ? (
                            <p className="about-team-intro mt-4">{description}</p>
                        ) : null}

                        {hasCtas ? (
                            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                                <TeamCta
                                    text={primaryCtaText}
                                    url={primaryCtaUrl}
                                    variant="outline"
                                />
                                <TeamCta
                                    text={secondaryCtaText}
                                    url={secondaryCtaUrl}
                                    variant="solid"
                                />
                            </div>
                        ) : null}
                    </div>
                </FadeUp>

                <div
                    className={`about-team-grid mt-12 grid gap-5 sm:gap-6 ${teamGridClass(members.length)}`}
                >
                    {members.map((member, index) => (
                        <FadeUp
                            key={member.id ?? `${member.name}-${index}`}
                            delay={index * 50}
                            className="h-full"
                        >
                            <TeamMemberCard member={member} />
                        </FadeUp>
                    ))}
                </div>
            </Container>
        </PageSection>
    );
};

export default LeadershipSection;
