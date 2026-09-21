import { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
    ArrowRight,
    FileText,
    Languages,
    Package,
    RefreshCw,
} from "lucide-react";

import { useAuth } from "../../auth/AuthContext";

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const {
        postStats,
        activityLoading,
        activityError,
        refetchPosts,
    } = useOutletContext();

    const stats = useMemo(
        () => ({
            total: postStats?.total ?? 0,
            published: postStats?.published ?? 0,
            pending: postStats?.pending ?? 0,
        }),
        [postStats]
    );

    const firstName = (user?.name || "Admin").split(" ")[0];

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <section className="rounded-2xl border border-line bg-theme-surface p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-theme-success-text">
                            BanMix Admin
                        </p>
                        <h1 className="type-admin-page-title mt-2 text-content">
                            {getGreeting()}, {firstName}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-content-muted">
                            Overview of product listings and website content
                            tools.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetchPosts?.()}
                        disabled={activityLoading}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-theme-surface px-4 text-sm font-semibold text-content-secondary transition hover:border-brand-green/30 hover:text-theme-success-text disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={activityLoading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </section>

            {activityError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {activityError}
                </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-theme-success-bg text-theme-success-text">
                            <Package size={18} />
                        </span>
                        <p className="type-admin-stat-label text-content-muted">
                            Total products
                        </p>
                    </div>
                    <p className="type-admin-stat-value mt-4 text-content">
                        {activityLoading ? "—" : stats.total}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={18} />
                        </span>
                        <p className="type-admin-stat-label text-content-muted">
                            Published
                        </p>
                    </div>
                    <p className="type-admin-stat-value mt-4 text-content">
                        {activityLoading ? "—" : stats.published}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                            <FileText size={18} />
                        </span>
                        <p className="type-admin-stat-label text-content-muted">
                            Pending review
                        </p>
                    </div>
                    <p className="type-admin-stat-value mt-4 text-content">
                        {activityLoading ? "—" : stats.pending}
                    </p>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                    to="/admin/posts"
                    className="group rounded-2xl border border-line bg-theme-surface p-6 shadow-sm transition hover:border-brand-green/30 hover:shadow-md"
                >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-theme-success-bg text-theme-success-text">
                        <Package size={20} />
                    </span>
                    <h2 className="mt-4 text-lg font-bold text-content">
                        Products
                    </h2>
                    <p className="mt-1 text-sm text-content-muted">
                        Review, publish, and manage product listings.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-theme-success-text">
                        Open products
                        <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-0.5"
                        />
                    </span>
                </Link>

                <Link
                    to="/admin/site-contents"
                    className="group rounded-2xl border border-line bg-theme-surface p-6 shadow-sm transition hover:border-brand-green/30 hover:shadow-md"
                >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-theme-success-bg text-theme-success-text">
                        <Languages size={20} />
                    </span>
                    <h2 className="mt-4 text-lg font-bold text-content">
                        Website Content
                    </h2>
                    <p className="mt-1 text-sm text-content-muted">
                        Edit multilingual public website pages and sections.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-theme-success-text">
                        Open website content
                        <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-0.5"
                        />
                    </span>
                </Link>
            </section>
        </div>
    );
};

export default AdminDashboard;
