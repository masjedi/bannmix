import { useCallback, useEffect, useState } from "react";

import { CheckCircle2, LoaderCircle, Star } from "lucide-react";

import productReviewsApi from "../../../api/productReviewsApi";
import { useLanguage } from "../../../context/LanguageContext";
import publicTranslations from "../../../i18n/publicTranslations";

import ProductRating from "./ProductRating";
import { formatProductRating, getProductRating, getProductReviewCount } from "./productUtils";

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

    const validateForm = () => {
        const errors = {};

        if (!form.reviewer_name.trim()) {
            errors.reviewer_name = translate(t.errorName);
        }

        if (form.rating < 1) {
            errors.rating = translate(t.errorRating);
        }

        if (form.reviewer_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reviewer_email)) {
            errors.reviewer_email = translate(t.errorEmail);
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

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-content-secondary">
                                {translate(t.ratingLabel)}
                            </label>
                            <div className="mt-2">
                                <ReviewStars
                                    value={form.rating}
                                    onChange={(value) => {
                                        setForm((current) => ({
                                            ...current,
                                            rating: value,
                                        }));
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
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.rating}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-content-secondary">
                                {translate(t.nameLabel)}
                            </label>
                            <input
                                type="text"
                                value={form.reviewer_name}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        reviewer_name: event.target.value,
                                    }))
                                }
                                disabled={submitting}
                                className="mt-2 h-10 w-full rounded-lg border border-line bg-theme-page px-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                            {fieldErrors.reviewer_name ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {fieldErrors.reviewer_name}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-content-secondary">
                                {translate(t.emailLabel)}
                            </label>
                            <input
                                type="email"
                                value={form.reviewer_email}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        reviewer_email: event.target.value,
                                    }))
                                }
                                disabled={submitting}
                                className="mt-2 h-10 w-full rounded-lg border border-line bg-theme-page px-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                            {fieldErrors.reviewer_email ? (
                                <p className="mt-1 text-xs text-red-600">
                                    {fieldErrors.reviewer_email}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-content-secondary">
                                {translate(t.commentLabel)}
                            </label>
                            <textarea
                                value={form.comment}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        comment: event.target.value,
                                    }))
                                }
                                disabled={submitting}
                                rows={4}
                                className="mt-2 w-full rounded-lg border border-line bg-theme-page px-3 py-2 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
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
