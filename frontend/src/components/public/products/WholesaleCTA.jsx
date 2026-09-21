import { MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { Container } from "../ui";
import { WHOLESALE_ID, wholesaleWhatsApp } from "./productUtils";

const WholesaleCTA = ({
    label,
    title,
    description,
    whatsappLabel,
    contactLabel,
    contactHref,
    translate,
    className = "",
}) => {
    const isInternalContact =
        typeof contactHref === "string" &&
        contactHref.startsWith("/") &&
        !contactHref.startsWith("//");

    const contactClassName =
        "home-hero-link min-h-12 w-full justify-center px-6 text-sm sm:w-auto";

    return (
        <section
            id={WHOLESALE_ID}
            className={[
                "scroll-mt-24 bg-theme-surface-warm py-12 sm:py-16",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <Container>
                <div className="mx-auto max-w-3xl px-6 py-10 text-center sm:px-10">
                    <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                        {label}
                    </p>
                    <h2 className="mt-3 text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-tight text-content">
                        {title}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-content-secondary sm:text-base">
                        {description}
                    </p>
                    <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href={wholesaleWhatsApp(translate)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="btn-primary min-h-12 w-full px-6 text-sm sm:w-auto"
                        >
                            <MessageCircle size={16} aria-hidden="true" />
                            {whatsappLabel}
                        </a>
                        {isInternalContact ? (
                            <Link to={contactHref} className={contactClassName}>
                                <Phone size={16} aria-hidden="true" />
                                {contactLabel}
                            </Link>
                        ) : (
                            <a href={contactHref} className={contactClassName}>
                                <Phone size={16} aria-hidden="true" />
                                {contactLabel}
                            </a>
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default WholesaleCTA;
