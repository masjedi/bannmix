import { useRef, useState } from "react";
import { Bell } from "lucide-react";

import useClickOutside from "./useClickOutside";

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setOpen(false), open);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Notifications"
                aria-expanded={open}
                className={[
                    "relative grid h-9 w-9 place-items-center rounded-lg border transition",
                    open
                        ? "border-line-strong bg-theme-surface-soft text-content"
                        : "border-line bg-theme-surface text-content-secondary hover:border-line-strong hover:text-content",
                ].join(" ")}
            >
                <Bell size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-theme-surface shadow-xl">
                    <div className="border-b border-line px-4 py-3">
                        <p className="text-sm font-bold text-content">
                            Notifications
                        </p>
                        <p className="mt-0.5 text-[11px] text-content-muted">
                            No pending activity
                        </p>
                    </div>

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
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
