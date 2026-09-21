import { useState } from "react";

import { AlertCircle, CheckCircle2, LoaderCircle, Mail } from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";
import publicTranslations from "../../i18n/publicTranslations";

const NEWSLETTER_MESSAGES = {
    invalidEmail: {
        en: "Enter a valid email address.",
        ps: "یو معتبر برېښنالیک ولیکئ.",
        fa: "یک آدرس ایمیل معتبر وارد کنید.",
    },
    success: {
        en: "Thank you for subscribing.",
        ps: "له ګډون څخه مو مننه.",
        fa: "از اشتراک شما سپاسگزاریم.",
    },
    error: {
        en: "Subscription failed. Please try again.",
        ps: "ګډون بریالی نه شو. بیا هڅه وکړئ.",
        fa: "اشتراک موفق نشد. دوباره تلاش کنید.",
    },
};

const NewsletterSubscription = ({
    variant = "footer",
    className = "",
    onSubscribe,
}) => {
    const { translate } = useLanguage();

    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setMessageType("");

        const normalizedEmail = email.trim();
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

        if (!validEmail) {
            setMessage(translate(NEWSLETTER_MESSAGES.invalidEmail));
            setMessageType("error");
            return;
        }

        if (typeof onSubscribe !== "function") {
            setMessage(translate(publicTranslations.newsletter.unavailable));
            setMessageType("info");
            return;
        }

        setSubmitting(true);

        try {
            await onSubscribe(normalizedEmail);
            setMessage(translate(NEWSLETTER_MESSAGES.success));
            setMessageType("success");
            setEmail("");
        } catch (error) {
            setMessage(
                error?.response?.data?.message ||
                    translate(NEWSLETTER_MESSAGES.error)
            );
            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
    };

    const isEmbedded = variant === "embedded";

    const content = (
        <div
            className={[
                isEmbedded
                    ? "newsletter-embedded grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center lg:gap-10"
                    : "grid gap-6 md:grid-cols-2 md:items-center",
                variant === "card" ? "theme-card rounded-2xl p-6 sm:p-8" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div>
                <div className="flex items-start gap-3">
                    {isEmbedded ? (
                        <span className="newsletter-embedded-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                            <Mail size={18} aria-hidden="true" />
                        </span>
                    ) : null}
                    <div>
                        <h2
                            className={[
                                "font-extrabold tracking-tight text-content",
                                isEmbedded
                                    ? "text-lg sm:text-xl"
                                    : "text-xl sm:text-2xl",
                            ].join(" ")}
                        >
                            {translate(publicTranslations.newsletter.title)}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-content-secondary">
                            {translate(
                                publicTranslations.newsletter.description
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div
                className={[
                    "w-full",
                    isEmbedded ? "lg:justify-self-end" : "max-w-lg md:justify-self-end",
                ].join(" ")}
            >
                <form
                    onSubmit={handleSubmit}
                    className={[
                        "flex flex-col gap-2",
                        isEmbedded ? "sm:flex-row sm:items-center" : "sm:flex-row",
                    ].join(" ")}
                >
                    <label className="relative mb-0 min-w-0 flex-1">
                        <span className="sr-only">
                            {translate(
                                publicTranslations.newsletter.emailLabel
                            )}
                        </span>
                        {!isEmbedded ? (
                            <Mail
                                size={16}
                                className="search-icon pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rtl:left-auto rtl:right-3"
                            />
                        ) : null}
                        <input
                            id="newsletter-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setMessage("");
                                setMessageType("");
                            }}
                            disabled={submitting}
                            required
                            aria-invalid={messageType === "error"}
                            aria-describedby={
                                message ? "newsletter-status" : undefined
                            }
                            placeholder={translate(
                                publicTranslations.newsletter.emailPlaceholder
                            )}
                            className={[
                                "newsletter-input mb-0 h-11 w-full disabled:cursor-not-allowed disabled:opacity-60",
                                isEmbedded
                                    ? "newsletter-embedded-input px-4"
                                    : "search-input pl-9 pr-3 rtl:pl-3 rtl:pr-9",
                            ].join(" ")}
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={[
                            "inline-flex h-11 shrink-0 items-center justify-center gap-2 px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60",
                            isEmbedded
                                ? "newsletter-embedded-submit"
                                : "btn-primary px-5",
                        ].join(" ")}
                    >
                        {submitting && (
                            <LoaderCircle size={15} className="animate-spin" />
                        )}
                        {translate(publicTranslations.newsletter.subscribe)}
                    </button>
                </form>

                {message && (
                    <div
                        id="newsletter-status"
                        role="status"
                        aria-live="polite"
                        className={[
                            "mt-3 flex items-center gap-2 text-xs font-medium",
                            messageType === "success"
                                ? "text-theme-success-text"
                                : messageType === "info"
                                  ? "text-content-secondary"
                                  : "text-theme-danger-text",
                        ].join(" ")}
                    >
                        {messageType === "success" ? (
                            <CheckCircle2 size={14} />
                        ) : (
                            <AlertCircle size={14} />
                        )}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );

    if (variant === "card") {
        return <div className={className}>{content}</div>;
    }

    if (variant === "embedded") {
        return content;
    }

    return (
        <section className={["newsletter-band", className].join(" ")}>
            <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 md:py-12 lg:px-8">
                {content}
            </div>
        </section>
    );
};

export default NewsletterSubscription;
