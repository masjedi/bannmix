import { useRef, useState } from "react";
import {
    Bell,
    LoaderCircle,
    Mail,
    MessageSquareQuote,
    MessageSquareText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import useAdminNotifications from "./useAdminNotifications";
import useClickOutside from "./useClickOutside";

const typeIcons = {
    contact_message: Mail,
    product_review: MessageSquareQuote,
    site_feedback: MessageSquareText,
};

const formatRelativeTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    } = useAdminNotifications();

    useClickOutside(ref, () => setOpen(false), open);

    const handleOpenNotification = async (notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        setOpen(false);

        if (notification.action_url) {
            navigate(notification.action_url);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Notifications"
                aria-expanded={open}
                className={[
                    "admin-header-icon-btn relative",
                    open ? "is-open" : "",
                ].join(" ")}
            >
                <Bell size={17} />
                {unreadCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-none text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                ) : null}
            </button>

            {open ? (
                <div className="admin-header-popover w-[min(22rem,calc(100vw-2rem))]">
                    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                        <div>
                            <p className="text-sm font-bold text-content">
                                Notifications
                            </p>
                            <p className="mt-0.5 text-[11px] text-content-muted">
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "No pending activity"}
                            </p>
                        </div>

                        {unreadCount > 0 ? (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-brand-orange hover:underline"
                            >
                                Mark all read
                            </button>
                        ) : null}
                    </div>

                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-content-muted">
                            <LoaderCircle size={16} className="animate-spin" />
                            Loading…
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                            <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-theme-page text-content-muted">
                                <Bell size={17} />
                            </span>

                            <p className="mt-3 text-sm font-semibold text-content-secondary">
                                No notifications
                            </p>

                            <p className="mt-1 text-xs text-content-muted">
                                You’re all caught up.
                            </p>
                        </div>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto py-1">
                            {notifications.map((notification) => {
                                const Icon =
                                    typeIcons[notification.type] || Bell;

                                return (
                                    <li key={notification.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOpenNotification(notification)
                                            }
                                            className={[
                                                "flex w-full gap-3 px-4 py-3 text-left transition hover:bg-theme-page",
                                                notification.is_read
                                                    ? "opacity-80"
                                                    : "bg-brand-orange/5",
                                            ].join(" ")}
                                        >
                                            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-theme-surface-soft text-brand-orange">
                                                <Icon size={16} />
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-start justify-between gap-2">
                                                    <span className="text-sm font-semibold text-content">
                                                        {notification.title}
                                                    </span>
                                                    {!notification.is_read ? (
                                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-orange" />
                                                    ) : null}
                                                </span>
                                                {notification.body ? (
                                                    <span className="mt-1 block text-xs leading-5 text-content-secondary">
                                                        {notification.body}
                                                    </span>
                                                ) : null}
                                                <span className="mt-1 block text-[11px] text-content-muted">
                                                    {formatRelativeTime(
                                                        notification.created_at
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <div className="border-t border-line px-4 py-3">
                        <Link
                            to="/admin/contact-messages"
                            onClick={() => setOpen(false)}
                            className="text-xs font-semibold text-brand-orange hover:underline"
                        >
                            View contact messages
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default NotificationBell;
