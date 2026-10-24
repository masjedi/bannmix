import { useCallback, useEffect, useState } from "react";

import { CheckCircle2, LoaderCircle, Star } from "lucide-react";

import productReviewsApi from "../../../api/productReviewsApi";
import { useLanguage } from "../../../context/LanguageContext";
import publicTranslations from "../../../i18n/publicTranslations";

import ProductRating from "./ProductRating";
import { formatProductRating, getProductRating, getProductReviewCount } from "./productUtils";

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const FIELD_LIMITS = {
    reviewer_name: 120,
    reviewer_email: 190,
    comment: 2000,
};

const extractReviews = (response) => {
    const payload = response?.data ?? response;
    const records = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

    const meta = payload?.meta ?? {};

    return {
        records,
        meta: {
            current_page: meta.current_page ?? 1,
            last_page: meta.last_page ?? 1,
            total: meta.total ?? records.length,
        },
    };
};

const ReviewStars = ({ value, onChange, disabled = false, size = 22 }) => (
    <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            const active = starValue <= value;

            return (
                <button
                    key={starValue}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(starValue)}
                    className="rounded p-0.5 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Rate ${starValue} stars`}
                >
                    <Star
                        size={size}
                        className={
                            active
                                ? "fill-brand-orange text-brand-orange"
                                : "text-content-muted"
                        }
                    />
                </button>
            );
        })}
    </div>
);

const ProductReviewSection = ({ product, onReviewSubmitted }) => {
    const { translate } = useLanguage();
    const t = publicTranslations.products.reviews;

    const [reviews, setReviews] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const [form, setForm] = useState({
        reviewer_name: "",
        reviewer_email: "",
        rating: 0,
        comment: "",
    });

    const loadReviews = useCallback(async (page = 1) => {
        if (!product?.id) return;

        setLoading(true);
        setError("");

        try {
            const response = await productReviewsApi.getProductReviews(product.id, {
                page,
                per_page: 5,
            });
            const normalized = extractReviews(response);
            setReviews(normalized.records);
            setMeta(normalized.meta);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    translate(t.loadError)
            );
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [product?.id, t.loadError, translate]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const updateField = (field) => (event) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value.slice(0, FIELD_LIMITS[field]),
        }));
        setSuccess("");
        setFieldErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const validateForm = () => {
        const errors = {};
        const name = form.reviewer_name.trim();
        const email = form.reviewer_email.trim();
        const comment = form.comment.trim();

        if (!name) {
            errors.reviewer_name = translate(t.errorName);
        } else if (name.length < 2) {
            errors.reviewer_name = translate(t.errorNameMin);
        } else if (name.length > FIELD_LIMITS.reviewer_name) {
            errors.reviewer_name = translate(t.errorNameMax);
        }

        if (form.rating < 1) {
            errors.rating = translate(t.errorRating);
        }

        if (email.length > FIELD_LIMITS.reviewer_email) {
            errors.reviewer_email = translate(t.errorEmailMax);
        } else if (email && !EMAIL_PATTERN.test(email)) {
            errors.reviewer_email = translate(t.errorEmail);
        }

        if (comment.length > FIELD_LIMITS.comment) {
            errors.comment = translate(t.errorCommentMax);
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccess("");
        setError("");

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await productReviewsApi.submitReview(product.id, {
                reviewer_name: form.reviewer_name.trim(),
                reviewer_email: form.reviewer_email.trim() || undefined,
                rating: form.rating,
                comment: form.comment.trim() || undefined,
            });

            setSuccess(
                response?.message || translate(t.submitSuccess)
            );
            setForm({
                reviewer_name: "",
                reviewer_email: "",
                rating: 0,
                comment: "",
            });
            setFieldErrors({});
            onReviewSubmitted?.();
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
                setError(
                    requestError?.response?.data?.message ||
                        translate(t.submitError)
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const rating = getProductRating(product);
    const reviewCount = getProductReviewCount(product);

    return (
        <section className="mt-10 border-t border-line pt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-content">
                        {translate(t.title)}
                    </h2>
                    <p className="mt-1 text-sm text-content-muted">
                        {translate(t.subtitle)}
                    </p>
                </div>

                {reviewCount > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-content-secondary">
                        <ProductRating product={product} size={16} showCount={false} />
                        <span className="text-content-muted">
                            {formatProductRating(rating)} · {reviewCount}{" "}
                            {translate(t.reviewsCountLabel)}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <h3 className="text-base font-bold text-content">
                        {translate(t.writeReview)}
                    </h3>

                    <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
                        <div>
                            <p
                                id="review-rating-label"
                                className="block text-sm font-medium text-content-secondary"
                            >
                                {translate(t.ratingLabel)}
                            </p>
                            <div
                                className="mt-2"
                                role="group"
                                aria-labelledby="review-rating-label"
                                aria-invalid={Boolean(fieldErrors.rating)}
                                aria-describedby={fieldErrors.rating ? "review-rating-error" : undefined}
                            >
                                <ReviewStars
                                    value={form.rating}
                                    onChange={(value) => {
                                        setForm((current) => ({
                                            ...current,
                                            rating: value,
                                        }));
                                        setSuccess("");
                                        if (fieldErrors.rating) {
                                            setFieldErrors((current) => {
                                                const next = { ...current };
                                                delete next.rating;
                                                return next;
                                            });
                                        }
                                    }}
                                    disabled={submitting}
                                />
                            </div>
                            {fieldErrors.rating ? (
                                <p id="review-rating-error" className="mt-1 text-xs text-red-600" role="alert">
                                    {fieldErrors.rating}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="review-name"
                                className="block text-sm font-medium text-content-secondary"
                            >
                                {translate(t.nameLabel)}
                            </label>
                            <input
                                id="review-name"
                                type="text"
                                name="reviewer_name"
                                autoComplete="name"
                                required
                                minLength={2}
                                maxLength={FIELD_LIMITS.reviewer_name}
                                aria-invalid={Boolean(fieldErrors.reviewer_name)}
                                aria-describedby={fieldErrors.reviewer_name ? "review-name-error" : undefined}
                                value={form.reviewer_name}
                                onChange={updateField("reviewer_name")}
                                disabled={submitting}
                                className="mt-2 h-10 w-full rounded-lg border border-line bg-theme-page px-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                            {fieldErrors.reviewer_name ? (
                                <p id="review-name-error" className="mt-1 text-xs text-red-600" role="alert">
                                    {fieldErrors.reviewer_name}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="review-email"
                                className="block text-sm font-medium text-content-secondary"
                            >
                                {translate(t.emailLabel)}
                            </label>
                            <input
                                id="review-email"
                                type="email"
                                name="reviewer_email"
                                autoComplete="email"
                                inputMode="email"
                                maxLength={FIELD_LIMITS.reviewer_email}
                                aria-invalid={Boolean(fieldErrors.reviewer_email)}
                                aria-describedby={fieldErrors.reviewer_email ? "review-email-error" : undefined}
                                value={form.reviewer_email}
                                onChange={updateField("reviewer_email")}
                                disabled={submitting}
                                className="mt-2 h-10 w-full rounded-lg border border-line bg-theme-page px-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                            {fieldErrors.reviewer_email ? (
                                <p id="review-email-error" className="mt-1 text-xs text-red-600" role="alert">
                                    {fieldErrors.reviewer_email}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="review-comment"
                                className="block text-sm font-medium text-content-secondary"
                            >
                                {translate(t.commentLabel)}
                            </label>
                            <textarea
                                id="review-comment"
                                name="comment"
                                maxLength={FIELD_LIMITS.comment}
                                aria-invalid={Boolean(fieldErrors.comment)}
                                aria-describedby={fieldErrors.comment ? "review-comment-error" : undefined}
                                value={form.comment}
                                onChange={updateField("comment")}
                                disabled={submitting}
                                rows={4}
                                className="mt-2 w-full rounded-lg border border-line bg-theme-page px-3 py-2 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                            {fieldErrors.comment ? (
                                <p id="review-comment-error" className="mt-1 text-xs text-red-600" role="alert">
                                    {fieldErrors.comment}
                                </p>
                            ) : null}
                        </div>

                        {error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : null}

                        {success ? (
                            <div className="flex items-start gap-2 rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-3 py-2 text-sm text-theme-success-text">
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                <p>{success}</p>
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-orange px-6 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <LoaderCircle size={16} className="animate-spin" />
                            ) : null}
                            {translate(t.submitLabel)}
                        </button>
                    </form>
                </div>

                <div>
                    <h3 className="text-base font-bold text-content">
                        {translate(t.customerReviews)}
                    </h3>

                    {loading ? (
                        <div className="mt-5 flex items-center gap-2 text-sm text-content-muted">
                            <LoaderCircle size={16} className="animate-spin" />
                            {translate(t.loadingReviews)}
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="mt-5 rounded-xl border border-dashed border-line bg-theme-page px-4 py-8 text-center text-sm text-content-muted">
                            {translate(t.emptyReviews)}
                        </p>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {reviews.map((review) => (
                                <li
                                    key={review.id}
                                    className="rounded-xl border border-line bg-theme-surface p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-semibold text-content">
                                            {review.reviewer_name}
                                        </p>
                                        <ReviewStars value={review.rating} disabled size={16} />
                                    </div>
                                    {review.comment ? (
                                        <p className="mt-3 text-sm leading-6 text-content-secondary">
                                            {review.comment}
                                        </p>
                                    ) : null}
                                    {review.created_at ? (
                                        <p className="mt-2 text-xs text-content-muted">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    )}

                    {meta.last_page > 1 ? (
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <button
                                type="button"
                                disabled={meta.current_page <= 1 || loading}
                                onClick={() => loadReviews(meta.current_page - 1)}
                                className="rounded-lg border border-line px-3 py-1.5 font-medium text-content-secondary transition hover:border-brand-blue disabled:opacity-50"
                            >
                                {translate(t.previousPage)}
                            </button>
                            <span className="text-content-muted">
                                {meta.current_page} / {meta.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={meta.current_page >= meta.last_page || loading}
                                onClick={() => loadReviews(meta.current_page + 1)}
                                className="rounded-lg border border-line px-3 py-1.5 font-medium text-content-secondary transition hover:border-brand-blue disabled:opacity-50"
                            >
                                {translate(t.nextPage)}
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default ProductReviewSection;
