import { useEffect, useId, useRef, useState } from "react";

import { CheckCircle2, LoaderCircle, MessageSquareText, Star, X } from "lucide-react";

import feedbackApi from "../../api/feedbackApi";
import { useLanguage } from "../../context/LanguageContext";
import publicTranslations from "../../i18n/publicTranslations";

const FEEDBACK_CLOSE_DELAY_MS = 900;
const FEEDBACK_NAME_MAX = 50;
const FEEDBACK_MESSAGE_MAX = 200;

const clampText = (value, max) => value.slice(0, max);

const formatCharCount = (template, current, max) =>
    template
        .replace("{current}", String(current))
        .replace("{max}", String(max));

const FeedbackWidget = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.feedback;
    const titleId = useId();
    const nameInputRef = useRef(null);
    const closeTimerRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitState, setSubmitState] = useState("idle");
    const [statusMessage, setStatusMessage] = useState("");

    const resetForm = () => {
        setName("");
        setRating(0);
        setHoverRating(0);
        setMessage("");
        setFieldErrors({});
        setSubmitState("idle");
        setStatusMessage("");
    };

    const closeModal = () => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }

        setOpen(false);
        resetForm();
    };

    useEffect(
        () => () => {
            if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current);
            }
        },
        []
    );

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.setTimeout(() => nameInputRef.current?.focus(), 60);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const validate = () => {
        const errors = {};
        const trimmedName = name.trim();
        const trimmedMessage = message.trim();

        if (!trimmedName) {
            errors.name = translate(t.errorName);
        } else if (name.length > FEEDBACK_NAME_MAX) {
            errors.name = translate(t.errorNameMax);
        }

        if (rating < 1) {
            errors.rating = translate(t.errorRating);
        }

        if (!trimmedMessage) {
            errors.message = translate(t.errorMessage);
        } else if (message.length > FEEDBACK_MESSAGE_MAX) {
            errors.message = translate(t.errorMessageMax);
        }

        return errors;
    };

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

    const nameCounterLabel = formatCharCount(
        translate(t.charCount),
        name.length,
        FEEDBACK_NAME_MAX
    );
    const messageCounterLabel = formatCharCount(
        translate(t.charCount),
        message.length,
        FEEDBACK_MESSAGE_MAX
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setStatusMessage("");
            setSubmitState("idle");
            return;
        }

        setFieldErrors({});
        setSubmitState("submitting");

        try {
            const response = await feedbackApi.submitFeedback({
                name: name.trim(),
                rating,
                message: message.trim(),
            });

            setSubmitState("success");
            setStatusMessage(response?.message || translate(t.success));

            closeTimerRef.current = window.setTimeout(() => {
                closeTimerRef.current = null;
                closeModal();
            }, FEEDBACK_CLOSE_DELAY_MS);
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
                setStatusMessage("");
                setFieldErrors({
                    message:
                        requestError?.response?.data?.message ||
                        "Your feedback could not be sent. Please try again.",
                });
            }

            setSubmitState("idle");
        }
    };

    const activeRating = hoverRating || rating;
    const isSubmitting = submitState === "submitting";
    const isSuccess = submitState === "success";

    return (
        <>
            <button
                type="button"
                className={["feedback-tab", open ? "is-open" : ""]
                    .filter(Boolean)
                    .join(" ")}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls="feedback-dialog"
                onClick={() => setOpen(true)}
            >
                <span className="feedback-tab-icon" aria-hidden="true">
                    <MessageSquareText size={16} />
                </span>
                <span className="feedback-tab-label">
                    {translate(t.buttonLabel)}
                </span>
            </button>

            {open ? (
                <div
                    className="feedback-backdrop"
                    onMouseDown={closeModal}
                >
                    <div
                        id="feedback-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        className="feedback-dialog"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="feedback-dialog-close"
                            aria-label={translate(t.close)}
                            onClick={closeModal}
                        >
                            <X size={16} aria-hidden="true" />
                        </button>

                        <div className="feedback-dialog-body">
                            <h2 id={titleId} className="feedback-dialog-title">
                                {translate(t.title)}
                            </h2>

                            <form
                                className="feedback-form"
                                onSubmit={handleSubmit}
                                noValidate
                            >
                                <div className="feedback-field">
                                    <label
                                        htmlFor="feedback-name"
                                        className="feedback-label"
                                    >
                                        {translate(t.nameLabel)}
                                    </label>
                                    <input
                                        ref={nameInputRef}
                                        id="feedback-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={name}
                                        disabled={isSubmitting || isSuccess}
                                        aria-invalid={Boolean(fieldErrors.name)}
                                        maxLength={FEEDBACK_NAME_MAX}
                                        aria-describedby={[
                                            "feedback-name-counter",
                                            fieldErrors.name
                                                ? "feedback-name-error"
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        placeholder={translate(
                                            t.namePlaceholder
                                        )}
                                        className="feedback-input"
                                        onChange={(event) => {
                                            setName(
                                                clampText(
                                                    event.target.value,
                                                    FEEDBACK_NAME_MAX
                                                )
                                            );
                                            clearFieldError("name");
                                        }}
                                    />
                                    <p
                                        id="feedback-name-counter"
                                        className={[
                                            "feedback-counter",
                                            name.length >= FEEDBACK_NAME_MAX
                                                ? "is-limit"
                                                : "",
                                        ].join(" ")}
                                        aria-live="polite"
                                    >
                                        {nameCounterLabel}
                                    </p>
                                    {fieldErrors.name ? (
                                        <p
                                            id="feedback-name-error"
                                            className="feedback-error"
                                        >
                                            {fieldErrors.name}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="feedback-field">
                                    <p
                                        id="feedback-rating-label"
                                        className="feedback-label"
                                    >
                                        {translate(t.ratingPrompt)}
                                    </p>
                                    <div
                                        className="feedback-stars"
                                        role="group"
                                        aria-labelledby="feedback-rating-label"
                                        aria-describedby={
                                            fieldErrors.rating
                                                ? "feedback-rating-error"
                                                : undefined
                                        }
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        {[1, 2, 3, 4, 5].map((value) => {
                                            const filled = value <= activeRating;

                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    className={[
                                                        "feedback-star",
                                                        filled ? "is-filled" : "",
                                                    ].join(" ")}
                                                    aria-label={translate(
                                                        t.rateStar
                                                    ).replace(
                                                        "{value}",
                                                        String(value)
                                                    )}
                                                    aria-pressed={
                                                        rating === value
                                                    }
                                                    disabled={
                                                        isSubmitting ||
                                                        isSuccess
                                                    }
                                                    onMouseEnter={() =>
                                                        setHoverRating(value)
                                                    }
                                                    onFocus={() =>
                                                        setHoverRating(value)
                                                    }
                                                    onBlur={() =>
                                                        setHoverRating(0)
                                                    }
                                                    onClick={() => {
                                                        setRating(value);
                                                        if (fieldErrors.rating) {
                                                            setFieldErrors(
                                                                (current) => {
                                                                    const next =
                                                                        {
                                                                            ...current,
                                                                        };
                                                                    delete next.rating;
                                                                    return next;
                                                                }
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Star
                                                        size={28}
                                                        strokeWidth={1.5}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {fieldErrors.rating ? (
                                        <p
                                            id="feedback-rating-error"
                                            className="feedback-error"
                                        >
                                            {fieldErrors.rating}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="feedback-field">
                                    <label
                                        htmlFor="feedback-message"
                                        className="feedback-label"
                                    >
                                        {translate(t.messagePrompt)}
                                    </label>
                                    <textarea
                                        id="feedback-message"
                                        name="message"
                                        rows={5}
                                        value={message}
                                        disabled={isSubmitting || isSuccess}
                                        aria-invalid={Boolean(
                                            fieldErrors.message
                                        )}
                                        maxLength={FEEDBACK_MESSAGE_MAX}
                                        aria-describedby={[
                                            "feedback-message-counter",
                                            fieldErrors.message
                                                ? "feedback-message-error"
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        placeholder={translate(
                                            t.messagePlaceholder
                                        )}
                                        className="feedback-textarea"
                                        onChange={(event) => {
                                            setMessage(
                                                clampText(
                                                    event.target.value,
                                                    FEEDBACK_MESSAGE_MAX
                                                )
                                            );
                                            clearFieldError("message");
                                        }}
                                    />
                                    <p
                                        id="feedback-message-counter"
                                        className={[
                                            "feedback-counter",
                                            message.length >=
                                            FEEDBACK_MESSAGE_MAX
                                                ? "is-limit"
                                                : "",
                                        ].join(" ")}
                                        aria-live="polite"
                                    >
                                        {messageCounterLabel}
                                    </p>
                                    {fieldErrors.message ? (
                                        <p
                                            id="feedback-message-error"
                                            className="feedback-error"
                                        >
                                            {fieldErrors.message}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="feedback-actions">
                                    <button
                                        type="submit"
                                        className="feedback-submit"
                                        disabled={isSubmitting || isSuccess}
                                    >
                                        {isSubmitting ? (
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                        {translate(t.submit)}
                                    </button>
                                </div>

                                {statusMessage ? (
                                    <div
                                        className="feedback-status"
                                        role="status"
                                        aria-live="polite"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        {statusMessage}
                                    </div>
                                ) : null}
                            </form>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default FeedbackWidget;
