import { useCallback, useEffect, useMemo, useState } from "react";

import {
    CheckCircle2,
    LoaderCircle,
    MessageSquareText,
    Star,
    Trash2,
    XCircle,
} from "lucide-react";

import siteFeedbackApi from "../../api/siteFeedbackApi";
import DataTable from "../../components/DataTable";

const extractList = (response) => {
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
    pending:
        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
    approved:
        "bg-theme-success-bg text-theme-success-text border-theme-success-text/20",
    rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300",
};

const statusLabels = {
    pending: "Draft",
    approved: "Approved",
    rejected: "Rejected",
};

const SiteFeedbackPage = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const loadFeedback = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await siteFeedbackApi.getFeedback({
                status: statusFilter || undefined,
                per_page: 100,
            });
            const normalized = extractList(response);
            setEntries(normalized.records);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not load feedback."
            );
            setEntries([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadFeedback();
    }, [loadFeedback]);

    const stats = useMemo(
        () => ({
            total: entries.length,
            draft: entries.filter((item) => item.status === "pending").length,
            approved: entries.filter((item) => item.status === "approved").length,
            rejected: entries.filter((item) => item.status === "rejected").length,
        }),
        [entries]
    );

    const updateStatus = async (id, status) => {
        setActionId(id);
        setError("");
        setSuccess("");

        try {
            await siteFeedbackApi.updateStatus(id, status);
            setSuccess(
                status === "approved"
                    ? "Feedback approved. It will now appear on the public website."
                    : status === "rejected"
                      ? "Feedback rejected."
                      : "Feedback moved back to draft."
            );
            await loadFeedback();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not update feedback status."
            );
        } finally {
            setActionId(null);
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm("Delete this feedback permanently?")) {
            return;
        }

        setActionId(id);
        setError("");
        setSuccess("");

        try {
            await siteFeedbackApi.deleteFeedback(id);
            setSuccess("Feedback deleted.");
            await loadFeedback();
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not delete feedback."
            );
        } finally {
            setActionId(null);
        }
    };

    const columns = useMemo(
        () => [
            {
                header: "Customer",
                accessor: "name",
                render: (row) => (
                    <div className="min-w-[10rem]">
                        <p className="font-semibold text-content">{row.name}</p>
                        <p className="mt-1 text-xs text-content-muted">
                            {row.created_at
                                ? new Date(row.created_at).toLocaleString()
                                : ""}
                        </p>
                    </div>
                ),
            },
            {
                header: "Rating",
                accessor: "rating",
                align: "center",
                render: (row) => (
                    <div className="inline-flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                size={14}
                                className={
                                    index < row.rating
                                        ? "fill-brand-orange text-brand-orange"
                                        : "text-brand-orange/30"
                                }
                            />
                        ))}
                    </div>
                ),
            },
            {
                header: "Feedback",
                accessor: "message",
                render: (row) => (
                    <p className="max-w-md text-sm leading-6 text-content-secondary">
                        {row.message}
                    </p>
                ),
            },
            {
                header: "Status",
                accessor: "status",
                render: (row) => (
                    <span
                        className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                            statusStyles[row.status] || statusStyles.pending,
                        ].join(" ")}
                    >
                        {statusLabels[row.status] || "Draft"}
                    </span>
                ),
            },
        ],
        []
    );

    return (
        <section className="space-y-6">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                    <MessageSquareText size={14} />
                    Feedback
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-content">
                    Site Feedback
                </h1>
                <p className="mt-1 text-sm text-content-muted">
                    Incoming feedback arrives as draft. Approve to show it on the
                    public Home testimonials section.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">Total</p>
                    <p className="mt-2 text-3xl font-semibold text-content">
                        {stats.total}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">Draft</p>
                    <p className="mt-2 text-3xl font-semibold text-amber-700">
                        {stats.draft}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">
                        Approved
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-theme-success-text">
                        {stats.approved}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">
                        Rejected
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-red-600">
                        {stats.rejected}
                    </p>
                </div>
            </div>

            {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            {success ? (
                <p className="rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text">
                    {success}
                </p>
            ) : null}

            <DataTable
                title="Incoming feedback"
                subtitle="Draft items stay private until you approve them."
                columns={columns}
                data={entries}
                loading={loading}
                rowKey="id"
                searchable
                searchPlaceholder="Search by name or message…"
                onRefresh={loadFeedback}
                refreshLoading={loading}
                exportable={false}
                printable={false}
                emptyText="No feedback yet. Submissions from the public widget will appear here as drafts."
                headerActions={
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="h-10 rounded-lg border border-line bg-theme-surface px-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Draft</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                }
                actions={(row) => (
                    <div className="flex flex-wrap items-center gap-2">
                        {row.status !== "approved" ? (
                            <button
                                type="button"
                                disabled={actionId === row.id}
                                onClick={() => updateStatus(row.id, "approved")}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-green px-2.5 text-xs font-semibold text-white transition hover:bg-brand-green/90 disabled:opacity-60"
                            >
                                {actionId === row.id ? (
                                    <LoaderCircle size={13} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={13} />
                                )}
                                Approve
                            </button>
                        ) : null}

                        {row.status !== "rejected" ? (
                            <button
                                type="button"
                                disabled={actionId === row.id}
                                onClick={() => updateStatus(row.id, "rejected")}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-theme-surface px-2.5 text-xs font-semibold text-content-secondary transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-60"
                            >
                                <XCircle size={13} />
                                Reject
                            </button>
                        ) : null}

                        {row.status !== "pending" ? (
                            <button
                                type="button"
                                disabled={actionId === row.id}
                                onClick={() => updateStatus(row.id, "pending")}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-content-secondary transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-60"
                            >
                                Draft
                            </button>
                        ) : null}

                        <button
                            type="button"
                            disabled={actionId === row.id}
                            onClick={() => deleteFeedback(row.id)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                            <Trash2 size={13} />
                            Delete
                        </button>
                    </div>
                )}
            />
        </section>
    );
};

export default SiteFeedbackPage;
