import { useState } from "react";

import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";

import contactApi from "../../../api/contactApi";
import { Container, FadeUp, PageSection } from "../ui";
import { hasText } from "./contactUtils";

const EMAIL_PATTERN =
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const FIELD_LIMITS = {
    name: 50,
    email: 50,
    subject: 100,
    message: 200,
};

const clampText = (value, max) => value.slice(0, max);

const formatCharCount = (template, current, max) =>
    template
        .replace("{current}", String(current))
        .replace("{max}", String(max));

const ContactInfoItem = ({ icon: Icon, label, value, href }) => {
    if (!hasText(value)) return null;

    const inner = (
        <>
            <span className="contact-info-icon" aria-hidden="true">
                <Icon size={16} strokeWidth={1.75} />
            </span>
            <span className="contact-info-copy">
                <span className="contact-info-label">{label}</span>
                <span className="contact-info-value">{value}</span>
            </span>
            {hasText(href) ? (
                <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="contact-info-arrow rtl:rotate-180"
                />
            ) : null}
        </>
    );

    if (hasText(href)) {
        return (
            <a href={href} className="contact-info-item is-link">
                {inner}
            </a>
        );
    }

    return <div className="contact-info-item">{inner}</div>;
};

const ContactMainSection = ({
    label,
    title,
    description,
    infoNote,
    phoneLabel,
    emailLabel,
    whatsappLabel,
    whatsappAction,
    phone,
    phoneHref,
    email,
    whatsappHref,
    formHeaderLabel,
    formHeaderTitle,
    formHeaderBody,
    formNameLabel,
    formEmailLabel,
    formSubjectLabel,
    formMessageLabel,
    formSubmitLabel,
    formSendingLabel,
    formSentLabel,
    formErrorName,
    formErrorNameMax,
    formErrorEmail,
    formErrorEmailMax,
    formErrorSubjectMax,
    formErrorMessage,
    formErrorMessageMax,
    formMessageCount,
    formErrorInvalidEmail,
    formSubjectDefault,
}) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: clampText(formSubjectDefault || "", FIELD_LIMITS.subject),
        message: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitState, setSubmitState] = useState("idle");
    const [submitError, setSubmitError] = useState("");

    const clearFieldError = (field) => {
        if (!fieldErrors[field]) {
            return;
        }

        setFieldErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const updateField = (field) => (event) => {
        const rawValue = event.target.value;
        const limit = FIELD_LIMITS[field];
        const nextValue = limit ? clampText(rawValue, limit) : rawValue;

        setForm((current) => ({
            ...current,
            [field]: nextValue,
        }));

        clearFieldError(field);

        if (submitState === "sent") {
            setSubmitState("idle");
        }
    };

    const validate = () => {
        const errors = {};
        const normalizedName = form.name.trim();
        const normalizedEmail = form.email.trim();
        const normalizedMessage = form.message.trim();

        if (!normalizedName) {
            errors.name = formErrorName;
        } else if (form.name.length > FIELD_LIMITS.name) {
            errors.name = formErrorNameMax;
        }

        if (!normalizedEmail) {
            errors.email = formErrorEmail;
        } else if (form.email.length > FIELD_LIMITS.email) {
            errors.email = formErrorEmailMax;
        } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
            errors.email = formErrorInvalidEmail;
        }

        if (form.subject.length > FIELD_LIMITS.subject) {
            errors.subject = formErrorSubjectMax;
        }

        if (!normalizedMessage) {
            errors.message = formErrorMessage;
        } else if (form.message.length > FIELD_LIMITS.message) {
            errors.message = formErrorMessageMax;
        }

        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setSubmitState("idle");
            return;
        }

        setFieldErrors({});
        setSubmitError("");
        setSubmitState("sending");

        try {
            await contactApi.submitMessage({
                name: form.name.trim(),
                email: form.email.trim(),
                subject: form.subject.trim() || undefined,
                message: form.message.trim(),
            });

            setSubmitState("sent");
        } catch (requestError) {
            const validationErrors = requestError?.response?.data?.errors;

            if (validationErrors && typeof validationErrors === "object") {
                const mapped = {};
                Object.entries(validationErrors).forEach(([key, messages]) => {
                    mapped[key] = Array.isArray(messages)
                        ? messages[0]
                        : String(messages);
                });
                setFieldErrors(mapped);
            } else {
                setSubmitError(
                    requestError?.response?.data?.message ||
                        "Your message could not be sent. Please try again."
                );
            }

            setSubmitState("idle");
        }
    };

    const isSubmitting = submitState === "sending";
    const isSent = submitState === "sent";
    const messageCounterLabel = formatCharCount(
        formMessageCount,
        form.message.length,
        FIELD_LIMITS.message
    );

    return (
        <PageSection pad={false} className="contact-main">
            <Container className="contact-main-shell">
                <div className="contact-main-glow" aria-hidden="true" />

                <FadeUp className="contact-unified-card">
                    <div className="contact-unified-inner">
                        <div className="contact-unified-info contact-unified-stagger contact-unified-stagger--1">
                            {hasText(label) ? (
                                <p className="contact-unified-eyebrow">{label}</p>
                            ) : null}

                            {hasText(title) ? (
                                <h2
                                    className={[
                                        "contact-unified-title",
                                        hasText(label) ? "mt-3" : "",
                                    ].join(" ")}
                                >
                                    {title}
                                </h2>
                            ) : null}

                            {hasText(description) ? (
                                <p className="contact-unified-desc mt-4">
                                    {description}
                                </p>
                            ) : null}

                            <div className="contact-info-list">
                                <ContactInfoItem
                                    icon={Phone}
                                    label={phoneLabel}
                                    value={phone}
                                    href={phoneHref}
                                />
                                <ContactInfoItem
                                    icon={Mail}
                                    label={emailLabel}
                                    value={email}
                                    href={`mailto:${email}`}
                                />
                                <ContactInfoItem
                                    icon={MessageCircle}
                                    label={whatsappLabel}
                                    value={whatsappAction}
                                    href={whatsappHref}
                                />
                            </div>

                            {hasText(infoNote) ? (
                                <p className="contact-unified-note">{infoNote}</p>
                            ) : null}
                        </div>

                        <div
                            className="contact-unified-divider"
                            aria-hidden="true"
                        />

                        <form
                            className="contact-unified-form contact-unified-stagger contact-unified-stagger--2"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <div className="contact-form-header">
                                {hasText(formHeaderLabel) ? (
                                    <p className="contact-form-eyebrow">
                                        {formHeaderLabel}
                                    </p>
                                ) : null}
                                {hasText(formHeaderTitle) ? (
                                    <h3 className="contact-form-title">
                                        {formHeaderTitle}
                                    </h3>
                                ) : null}
                                {hasText(formHeaderBody) ? (
                                    <p className="contact-form-intro">
                                        {formHeaderBody}
                                    </p>
                                ) : null}
                            </div>

                            <div className="contact-form-grid">
                                <div className="contact-form-field">
                                    <label htmlFor="contact-name">
                                        {formNameLabel}
                                    </label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        required
                                        maxLength={FIELD_LIMITS.name}
                                        aria-invalid={Boolean(fieldErrors.name)}
                                        aria-describedby={
                                            fieldErrors.name
                                                ? "contact-name-error"
                                                : undefined
                                        }
                                        className="theme-input contact-form-input"
                                        value={form.name}
                                        onChange={updateField("name")}
                                    />
                                    {fieldErrors.name ? (
                                        <p
                                            id="contact-name-error"
                                            className="contact-form-error"
                                            role="alert"
                                        >
                                            {fieldErrors.name}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="contact-form-field">
                                    <label htmlFor="contact-email">
                                        {formEmailLabel}
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        inputMode="email"
                                        required
                                        maxLength={FIELD_LIMITS.email}
                                        aria-invalid={Boolean(fieldErrors.email)}
                                        aria-describedby={
                                            fieldErrors.email
                                                ? "contact-email-error"
                                                : undefined
                                        }
                                        className="theme-input contact-form-input"
                                        value={form.email}
                                        onChange={updateField("email")}
                                    />
                                    {fieldErrors.email ? (
                                        <p
                                            id="contact-email-error"
                                            className="contact-form-error"
                                            role="alert"
                                        >
                                            {fieldErrors.email}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="contact-form-field contact-form-field--full">
                                    <label htmlFor="contact-subject">
                                        {formSubjectLabel}
                                    </label>
                                    <input
                                        id="contact-subject"
                                        type="text"
                                        name="subject"
                                        maxLength={FIELD_LIMITS.subject}
                                        aria-invalid={Boolean(fieldErrors.subject)}
                                        aria-describedby={
                                            fieldErrors.subject
                                                ? "contact-subject-error"
                                                : undefined
                                        }
                                        className="theme-input contact-form-input"
                                        value={form.subject}
                                        onChange={updateField("subject")}
                                    />
                                    {fieldErrors.subject ? (
                                        <p
                                            id="contact-subject-error"
                                            className="contact-form-error"
                                            role="alert"
                                        >
                                            {fieldErrors.subject}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="contact-form-field contact-form-field--full">
                                    <label htmlFor="contact-message">
                                        {formMessageLabel}
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows={5}
                                        required
                                        maxLength={FIELD_LIMITS.message}
                                        aria-invalid={Boolean(fieldErrors.message)}
                                        aria-describedby={[
                                            "contact-message-counter",
                                            fieldErrors.message
                                                ? "contact-message-error"
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        className="theme-input contact-form-input contact-form-textarea"
                                        value={form.message}
                                        onChange={updateField("message")}
                                    />
                                    <p
                                        id="contact-message-counter"
                                        className={[
                                            "contact-form-counter",
                                            form.message.length >=
                                            FIELD_LIMITS.message
                                                ? "is-limit"
                                                : "",
                                        ].join(" ")}
                                        aria-live="polite"
                                    >
                                        {messageCounterLabel}
                                    </p>
                                    {fieldErrors.message ? (
                                        <p
                                            id="contact-message-error"
                                            className="contact-form-error"
                                            role="alert"
                                        >
                                            {fieldErrors.message}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="contact-form-actions">
                                {submitError ? (
                                    <p className="contact-form-error" role="alert">
                                        {submitError}
                                    </p>
                                ) : null}

                                {isSent ? (
                                    <p
                                        className="contact-form-success"
                                        role="status"
                                        aria-live="polite"
                                    >
                                        {formSentLabel}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    className="btn-primary contact-form-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? formSendingLabel
                                        : formSubmitLabel}
                                    {!isSubmitting ? (
                                        <ArrowRight
                                            size={16}
                                            aria-hidden="true"
                                            className="contact-form-submit-arrow rtl:rotate-180"
                                        />
                                    ) : null}
                                </button>
                            </div>
                        </form>
                    </div>
                </FadeUp>
            </Container>
        </PageSection>
    );
};

export default ContactMainSection;
