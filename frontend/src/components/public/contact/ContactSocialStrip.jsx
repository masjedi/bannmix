import { Mail, MessageCircle } from "lucide-react";

import { Container, FadeUp, PageSection } from "../ui";
import { hasText } from "./contactUtils";

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

const SocialLink = ({ href, label, children }) => {
    if (!hasText(href)) return null;

    return (
        <a
            href={href}
            aria-label={label}
            target="_blank"
            rel="noreferrer noopener"
            className="contact-social-link"
        >
            {children}
            <span>{label}</span>
        </a>
    );
};

const ContactSocialStrip = ({
    label,
    email,
    emailHref,
    whatsappHref,
    whatsappLabel,
    facebookHref = "#",
    instagramHref = "#",
    facebookLabel = "Facebook",
    instagramLabel = "Instagram",
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
                        <SocialLink href={facebookHref} label={facebookLabel}>
                            <Facebook className="h-4 w-4" />
                        </SocialLink>
                        <SocialLink href={instagramHref} label={instagramLabel}>
                            <Instagram className="h-4 w-4" />
                        </SocialLink>
                    </div>
                </div>
            </FadeUp>
        </Container>
    </PageSection>
);

export default ContactSocialStrip;
