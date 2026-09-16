import { useEffect, useState } from "react";
import { FileText, Languages, LayoutDashboard, Search } from "lucide-react";

import Modal from "../../Modal";

const Toggle = ({ checked, onChange, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            checked ? "bg-brand-green" : "bg-theme-surface-soft"
        }`}
    >
        <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                checked ? "translate-x-5" : "translate-x-0.5"
            }`}
        />
    </button>
);

const AdminUserPanel = ({
    panel,
    onClose,
    user,
    collapsed,
    onCollapsedChange,
    autoRefreshEnabled,
    onAutoRefreshChange,
    onNavigate,
    onOpenQuickSearch,
}) => {
    const [copied, setCopied] = useState(false);
    const open = Boolean(panel);

    useEffect(() => {
        if (!open) {
            setCopied(false);
        }
    }, [open]);

    const titleMap = {
        profile: "My Profile",
        settings: "Admin Settings",
        help: "Help & Support",
    };

    const copyEmail = async () => {
        if (!user?.email) {
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(user.email);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = user.email;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";

                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const openPage = (path) => {
        onClose();
        onNavigate(path);
    };

    const openSearch = () => {
        onClose();
        window.setTimeout(onOpenQuickSearch, 0);
    };

    const resetLayoutPreferences = () => {
        onCollapsedChange(false);
        onAutoRefreshChange(true);
    };

    const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || "A";

    return (
        <Modal
            open={open}
            title={titleMap[panel] || "Admin Account"}
            size="lg"
            onClose={onClose}
        >
            {panel === "profile" && (
                <div className="space-y-5">
                    <div className="flex items-center gap-4 rounded-2xl border border-line bg-theme-page p-5">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-green to-brand-green text-2xl font-bold text-white">
                            {initials.toUpperCase()}
                        </span>

                        <div className="min-w-0">
                            <h3 className="truncate text-xl font-bold text-content">
                                {user?.name || "Administrator"}
                            </h3>

                            <p className="mt-1 truncate text-sm text-content-muted">
                                {user?.email || "No email available"}
                            </p>

                            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-theme-success-bg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-theme-success-text">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                                {user?.role || "admin"}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-line bg-theme-surface p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-content-muted">
                                Full Name
                            </p>
                            <p className="mt-2 text-sm font-semibold text-content">
                                {user?.name || "Administrator"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-line bg-theme-surface p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-content-muted">
                                Account Role
                            </p>
                            <p className="mt-2 text-sm font-semibold capitalize text-content">
                                {user?.role || "admin"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-theme-surface p-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-content-muted">
                                Email Address
                            </p>
                            <p className="mt-2 break-words text-sm font-semibold text-content">
                                {user?.email || "No email available"}
                            </p>
                        </div>

                        {user?.email && (
                            <button
                                type="button"
                                onClick={copyEmail}
                                className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-content-secondary transition hover:border-brand-green/30 hover:text-theme-success-text"
                            >
                                {copied ? "Copied" : "Copy email"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {panel === "settings" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-theme-surface p-4">
                        <div>
                            <p className="text-sm font-bold text-content">
                                Collapse desktop sidebar
                            </p>
                            <p className="mt-1 text-xs leading-5 text-content-muted">
                                Switch between the full and compact sidebar.
                            </p>
                        </div>

                        <Toggle
                            checked={collapsed}
                            onChange={onCollapsedChange}
                            label="Collapse desktop sidebar"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-theme-surface p-4">
                        <div>
                            <p className="text-sm font-bold text-content">
                                Automatic data refresh
                            </p>
                            <p className="mt-1 text-xs leading-5 text-content-muted">
                                Refresh product search data every 30 seconds.
                            </p>
                        </div>

                        <Toggle
                            checked={autoRefreshEnabled}
                            onChange={onAutoRefreshChange}
                            label="Automatic data refresh"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={resetLayoutPreferences}
                        className="w-full rounded-xl border border-line bg-theme-surface p-4 text-left transition hover:border-brand-green/30 hover:bg-theme-success-bg/30"
                    >
                        <p className="text-sm font-bold text-content">
                            Reset layout preferences
                        </p>
                        <p className="mt-1 text-xs text-content-muted">
                            Expand the sidebar and enable automatic refresh.
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => openPage("/admin")}
                        className="w-full rounded-xl border border-line bg-theme-surface p-4 text-left transition hover:border-brand-green/30 hover:bg-theme-success-bg/30"
                    >
                        <LayoutDashboard
                            size={18}
                            className="text-theme-success-text"
                        />
                        <p className="mt-3 text-sm font-bold text-content">
                            Open Admin Dashboard
                        </p>
                        <p className="mt-1 text-xs text-content-muted">
                            Return to the main administrative overview.
                        </p>
                    </button>
                </div>
            )}

            {panel === "help" && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-theme-success-text/20 bg-theme-success-bg p-4">
                        <p className="text-sm font-bold text-theme-success-text">
                            BanMix Admin Help
                        </p>
                        <p className="mt-1 text-xs leading-5 text-theme-success-text">
                            Open the most common administrative tools below.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => openPage("/admin/posts")}
                            className="rounded-xl border border-line bg-theme-surface p-4 text-left transition hover:border-brand-green/30 hover:bg-theme-success-bg/30"
                        >
                            <FileText size={18} className="text-theme-success-text" />
                            <p className="mt-3 text-sm font-bold text-content">
                                Products
                            </p>
                            <p className="mt-1 text-xs leading-5 text-content-muted">
                                Review and manage product listings.
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => openPage("/admin/site-contents")}
                            className="rounded-xl border border-line bg-theme-surface p-4 text-left transition hover:border-brand-green/30 hover:bg-theme-success-bg/30"
                        >
                            <Languages
                                size={18}
                                className="text-theme-success-text"
                            />
                            <p className="mt-3 text-sm font-bold text-content">
                                Website Content
                            </p>
                            <p className="mt-1 text-xs leading-5 text-content-muted">
                                Edit multilingual public website content.
                            </p>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={openSearch}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-theme-page p-4 text-left transition hover:border-brand-green/30 hover:bg-theme-success-bg/30"
                    >
                        <span className="flex items-center gap-3">
                            <Search size={18} className="text-theme-success-text" />
                            <span>
                                <span className="block text-sm font-bold text-content">
                                    Open Quick Search
                                </span>
                                <span className="mt-1 block text-xs text-content-muted">
                                    Search pages and products.
                                </span>
                            </span>
                        </span>

                        <kbd className="rounded border border-line bg-theme-surface px-2 py-1 text-xs font-semibold text-content-muted">
                            Ctrl + K
                        </kbd>
                    </button>
                </div>
            )}

            <div className="mt-5 flex justify-end border-t border-line pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-theme-page px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-theme-surface-elevated"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default AdminUserPanel;
