import { useCallback, useEffect, useState } from "react";

import {
    CheckCircle2,
    LoaderCircle,
    Star,
    Trash2,
    XCircle,
} from "lucide-react";

import productReviewsApi from "../../../api/productReviewsApi";

const extractReviews = (response) => {
    const payload = response?.data ?? response;
    const records = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

    return {
        records,
        meta: payload?.meta ?? {},
    };
};

const statusStyles = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    approved: "bg-theme-success-bg text-theme-success-text border-theme-success-text/20",
    rejected: "bg-red-50 text-red-700 border-red-200",
};

const AdminProductReviewsPanel = ({ postId, onUpdated }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const loadReviews = useCallback(async () => {
        if (!postId) return;

        setLoading(true);
        setError("");

        try {
            const response = await productReviewsApi.getAdminPostReviews(postId, {
                status: statusFilter || undefined,
                per_page: 50,
            });
            const normalized = extractReviews(response);
            setReviews(normalized.records);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not load customer reviews."
            );
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [postId, statusFilter]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const updateStatus = async (reviewId, status) => {
        setActionId(reviewId);
        setError("");

        try {
            await productReviewsApi.updateReviewStatus(reviewId, status);
            await loadReviews();
            onUpdated?.();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not update review status."
            );
        } finally {
            setActionId(null);
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Delete this review permanently?")) {
            return;
        }

        setActionId(reviewId);
        setError("");

        try {
            await productReviewsApi.deleteReview(reviewId);
            await loadReviews();
            onUpdated?.();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not delete review."
            );
        } finally {
            setActionId(null);
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-extrabold text-content">
                        Customer Reviews
                    </h2>
                    <p className="mt-1 text-sm text-content-muted">
                        Approve reviews before they appear on the public product page.
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-10 rounded-lg border border-line bg-theme-surface px-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {error ? (
                <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}

            {loading ? (
                <div className="mt-8 flex items-center gap-2 text-sm text-content-muted">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading reviews…
                </div>
            ) : reviews.length === 0 ? (
                <p className="mt-8 rounded-xl border border-dashed border-line bg-theme-page px-4 py-10 text-center text-sm text-content-muted">
                    No customer reviews for this product yet.
                </p>
            ) : (
                <ul className="mt-6 space-y-4">
                    {reviews.map((review) => (
                        <li
                            key={review.id}
                            className="rounded-2xl border border-line bg-theme-page p-4"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="font-semibold text-content">
                                            {review.reviewer_name}
                                        </p>
                                        <span
                                            className={[
                                                "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                                                statusStyles[review.status] ||
                                                    "bg-theme-surface-soft text-content-secondary border-line",
                                            ].join(" ")}
                                        >
                                            {review.status}
                                        </span>
                                    </div>

                                    {review.reviewer_email ? (
                                        <p className="mt-1 text-xs text-content-muted">
                                            {review.reviewer_email}
                                        </p>
                                    ) : null}

                                    <div className="mt-2 flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                size={15}
                                                className={
                                                    index < review.rating
                                                        ? "fill-brand-orange text-brand-orange"
                                                        : "text-brand-orange/30"
                                                }
                                            />
                                        ))}
                                    </div>

                                    {review.comment ? (
                                        <p className="mt-3 text-sm leading-6 text-content-secondary">
                                            {review.comment}
                                        </p>
                                    ) : null}

                                    {review.created_at ? (
                                        <p className="mt-2 text-xs text-content-muted">
                                            {new Date(review.created_at).toLocaleString()}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-2">
                                    {review.status !== "approved" ? (
                                        <button
                                            type="button"
                                            disabled={actionId === review.id}
                                            onClick={() =>
                                                updateStatus(review.id, "approved")
                                            }
                                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-green px-3 text-xs font-semibold text-white transition hover:bg-brand-green/90 disabled:opacity-60"
                                        >
                                            {actionId === review.id ? (
                                                <LoaderCircle
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <CheckCircle2 size={14} />
                                            )}
                                            Approve
                                        </button>
                                    ) : null}

                                    {review.status !== "rejected" ? (
                                        <button
                                            type="button"
                                            disabled={actionId === review.id}
                                            onClick={() =>
                                                updateStatus(review.id, "rejected")
                                            }
                                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-theme-surface px-3 text-xs font-semibold text-content-secondary transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-60"
                                        >
                                            <XCircle size={14} />
                                            Reject
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        disabled={actionId === review.id}
                                        onClick={() => deleteReview(review.id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminProductReviewsPanel;
