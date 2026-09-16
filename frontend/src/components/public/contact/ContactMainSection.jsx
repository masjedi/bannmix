import { useState } from "react";

import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";

import { Container, FadeUp, PageSection } from "../ui";
import {
    buildContactMailto,
    hasText,
} from "./contactUtils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    formErrorEmail,
    formErrorMessage,
    formErrorInvalidEmail,
    formSubjectDefault,
}) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: formSubjectDefault || "",
        message: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitState, setSubmitState] = useState("idle");

    const updateField = (field) => (event) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));

        if (fieldErrors[field]) {
            setFieldErrors((current) => {
                const next = { ...current };
                delete next[field];
                return next;
            });
        }

        if (submitState === "sent") {
            setSubmitState("idle");
        }
    };

    const validate = () => {
        const errors = {};
        const normalizedEmail = form.email.trim();

        if (!normalizedEmail) {
            errors.email = formErrorEmail;
        } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
            errors.email = formErrorInvalidEmail;
        }

        if (!form.message.trim()) {
            errors.message = formErrorMessage;
        }

        return errors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setSubmitState("idle");
            return;
        }

        setFieldErrors({});
        setSubmitState("sending");

        const mailto = buildContactMailto({
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            to: email,
        });

        window.setTimeout(() => {
            window.location.href = mailto;
            setSubmitState("sent");
        }, 320);
    };

    const isSubmitting = submitState === "sending";
    const isSent = submitState === "sent";

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
                                        className="theme-input contact-form-input"
                                        value={form.name}
                                        onChange={updateField("name")}
                                    />
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
                                        className="theme-input contact-form-input"
                                        value={form.subject}
                                        onChange={updateField("subject")}
                                    />
                                </div>

                                <div className="contact-form-field contact-form-field--full">
                                    <label htmlFor="contact-message">
                                        {formMessageLabel}
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows={5}
                                        aria-invalid={Boolean(fieldErrors.message)}
                                        aria-describedby={
                                            fieldErrors.message
                                                ? "contact-message-error"
                                                : undefined
                                        }
                                        className="theme-input contact-form-input contact-form-textarea"
                                        value={form.message}
                                        onChange={updateField("message")}
                                    />
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
