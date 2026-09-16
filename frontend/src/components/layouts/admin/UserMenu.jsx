import { useRef, useState } from "react";
import {
    ChevronDown,
    HelpCircle,
    LogOut,
    Settings,
    User as UserIcon,
} from "lucide-react";

import useClickOutside from "./useClickOutside";

const UserMenu = ({ user, onLogout, loggingOut, onOpenPanel }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setOpen(false), open);

    const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || "A";

    const openPanel = (panel) => {
        setOpen(false);
        window.setTimeout(() => onOpenPanel(panel), 0);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="User menu"
                aria-expanded={open}
                className={[
                    "flex items-center gap-2 rounded-lg p-1 pr-2 transition",
                    open ? "bg-theme-surface-soft" : "hover:bg-theme-surface-soft",
                ].join(" ")}
            >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-green text-sm font-bold text-white">
                    {initials.toUpperCase()}
                </span>

                <span className="hidden text-right md:block">
                    <p className="text-sm font-semibold leading-tight text-content">
                        {user?.name || "Administrator"}
                    </p>

                    <p className="text-[10px] uppercase tracking-wider text-content-muted">
                        {user?.role || "admin"}
                    </p>
                </span>

                <ChevronDown
                    size={14}
                    className={[
                        "hidden text-content-muted transition md:block",
                        open ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-theme-surface shadow-xl">
                    <div className="border-b border-line bg-theme-page px-4 py-3">
                        <p className="truncate text-sm font-bold text-content">
                            {user?.name || "Administrator"}
                        </p>

                        <p className="truncate text-xs text-content-muted">
                            {user?.email || "admin@banmix.com"}
                        </p>

                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-theme-success-bg px-2 py-0.5 text-[10px] font-bold text-theme-success-text">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                            Online
                        </span>
                    </div>

                    <div className="p-1.5">
                        <button
                            type="button"
                            onClick={() => openPanel("profile")}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-secondary transition hover:bg-theme-surface-soft"
                        >
                            <UserIcon size={15} className="text-content-muted" />
                            My profile
                        </button>

                        <button
                            type="button"
                            onClick={() => openPanel("settings")}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-secondary transition hover:bg-theme-surface-soft"
                        >
                            <Settings size={15} className="text-content-muted" />
                            Settings
                        </button>

                        <button
                            type="button"
                            onClick={() => openPanel("help")}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-secondary transition hover:bg-theme-surface-soft"
                        >
                            <HelpCircle size={15} className="text-content-muted" />
                            Help & support
                        </button>
                    </div>

                    <div className="border-t border-line p-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            disabled={loggingOut}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                            <LogOut size={15} />
                            {loggingOut ? "Logging out…" : "Log out"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
