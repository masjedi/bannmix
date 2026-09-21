import { useRef, useState } from "react";
import {
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

    const initials = (
        user?.name?.charAt(0) ||
        user?.email?.charAt(0) ||
        "A"
    ).toUpperCase();

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
                    "admin-header-profile",
                    open ? "is-open" : "",
                ].join(" ")}
            >
                <span className="admin-header-avatar">{initials}</span>

                <span className="admin-header-profile-text hidden md:block">
                    <span className="admin-header-profile-name">
                        {user?.name || "Administrator"}
                    </span>
                    <span className="admin-header-profile-email">
                        {user?.email || "admin@banmix.com"}
                    </span>
                </span>
            </button>

            {open ? (
                <div className="admin-header-profile-menu">
                    <div className="admin-header-profile-menu-head">
                        <p className="truncate text-sm font-bold text-content">
                            {user?.name || "Administrator"}
                        </p>
                        <p className="truncate text-xs text-content-muted">
                            {user?.email || "admin@banmix.com"}
                        </p>
                    </div>

                    <div className="p-1.5">
                        <button
                            type="button"
                            onClick={() => openPanel("profile")}
                            className="admin-header-profile-menu-item"
                        >
                            <UserIcon size={15} />
                            My profile
                        </button>

                        <button
                            type="button"
                            onClick={() => openPanel("settings")}
                            className="admin-header-profile-menu-item"
                        >
                            <Settings size={15} />
                            Settings
                        </button>

                        <button
                            type="button"
                            onClick={() => openPanel("help")}
                            className="admin-header-profile-menu-item"
                        >
                            <HelpCircle size={15} />
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
                            className="admin-header-profile-menu-item admin-header-profile-menu-item-danger"
                        >
                            <LogOut size={15} />
                            {loggingOut ? "Logging out…" : "Log out"}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default UserMenu;
