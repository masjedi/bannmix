import { Globe, Mail, MessageCircle } from "lucide-react";

import { Container, FadeUp, PageSection } from "../ui";
import { hasText } from "./contactUtils";
import usePublicPageContent from "../../../hooks/usePublicPageContent";

const Facebook = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const Instagram = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.849s-.012 3.584-.069 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.012-4.849-.069c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072c-1.281.058-2.156.246-2.921.525a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .622 4.131C.343 4.896.155 5.771.097 7.052.039 8.332.025 8.741.025 12s.014 3.668.072 4.948c.058 1.281.246 2.156.525 2.921a5.88 5.88 0 0 0 1.384 2.126 5.88 5.88 0 0 0 2.126 1.384c.765.279 1.64.467 2.921.525C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.281-.058 2.156-.246 2.921-.525a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.279-.765.467-1.64.525-2.921.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.058-1.281-.246-2.156-.525-2.921a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.869.622c-.765-.279-1.64-.467-2.921-.525C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
);

const SocialLink = ({ href, label, children, compact = false }) => {
    if (!hasText(href)) return null;

    return (
        <a
            href={href}
            aria-label={label}
            title={label}
            target="_blank"
            rel="noreferrer noopener"
            className={compact ? "footer-social-link" : "contact-social-link"}
        >
            {children}
            <span className={compact ? "sr-only" : undefined}>{label}</span>
        </a>
    );
};

const X = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Linkedin = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
    </svg>
);

const Youtube = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
);

const TikTok = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.89-2.89c.3 0 .59.05.86.13V9.4a6.33 6.33 0 1 0 5.48 6.27V8.68A8.16 8.16 0 0 0 20.6 10V6.55c-.34 0-.68-.05-1.01-.14z" />
    </svg>
);

const profileIcon = (href) => {
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, "");
    const icons = { "facebook.com": Facebook, "instagram.com": Instagram, "linkedin.com": Linkedin,
        "twitter.com": X, "x.com": X, "tiktok.com": TikTok, "youtube.com": Youtube, "youtu.be": Youtube };
    return icons[host] ?? Globe;
};

const isProfileUrl = (href) => {
    try {
        return ["https:", "http:"].includes(new URL(href).protocol);
    } catch {
        return false;
    }
};

export const SocialProfileLinks = ({ compact = false }) => {
    // Reuse the Contact page request/cache so both placements share CMS data.
    const { getSection } = usePublicPageContent("contact");
    return getSection("social_links").filter((item) => isProfileUrl(item.button_url)).map((item) => {
        const Icon = profileIcon(item.button_url);
        return (
            <SocialLink key={item.id} href={item.button_url} label={item.title || item.content_key} compact={compact}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </SocialLink>
        );
    });
};

const ContactSocialStrip = ({
    label,
    emailHref,
    whatsappHref,
    whatsappLabel,
    emailLabel,
}) => (
    <PageSection pad={false} className="contact-social contact-page-end">
        <Container>
            <FadeUp>
                <div className="contact-social-inner">
                    {hasText(label) ? (
                        <p className="contact-social-label">{label}</p>
                    ) : null}

                    <div className="contact-social-links">
                        <SocialLink href={whatsappHref} label={whatsappLabel}>
                            <MessageCircle size={17} aria-hidden="true" />
                        </SocialLink>
                        <SocialLink href={emailHref} label={emailLabel}>
                            <Mail size={17} aria-hidden="true" />
                        </SocialLink>
                        <SocialProfileLinks />
                    </div>
                </div>
            </FadeUp>
        </Container>
    </PageSection>
);

export default ContactSocialStrip;
