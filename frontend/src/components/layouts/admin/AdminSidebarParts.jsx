import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { Activity, HelpCircle } from "lucide-react";

import { formatBadgeCount } from "./adminLayoutUtils";

export const SidebarTooltip = ({ label, children, align = "right" }) => {
    return (
        <span className="group/tooltip relative inline-flex">
            {children}

            <span
                role="tooltip"
                className={[
                    "pointer-events-none absolute top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg",
                    "border border-line-strong bg-theme-sidebar px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl",
                    "opacity-0 transition-all duration-150",
                    align === "right"
                        ? "left-full ml-3 -translate-x-1 group-hover/tooltip:translate-x-0 group-hover/tooltip:opacity-100"
                        : "right-full mr-3 translate-x-1 group-hover/tooltip:translate-x-0 group-hover/tooltip:opacity-100",
                ].join(" ")}
            >
                {label}

                <span
                    className={[
                        "absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-theme-sidebar",
                        align === "right"
                            ? "-left-1 border-b border-l border-line-strong"
                            : "-right-1 border-r border-t border-line-strong",
                    ].join(" ")}
                />
            </span>
        </span>
    );
};

export const SidebarSectionLabel = ({ label }) => {
    return (
        <p className="flex items-center gap-2 px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-theme-sidebar-muted first:pt-0">
            <span>{label}</span>
            <span className="h-px flex-1 bg-line-strong" />
        </p>
    );
};

export const SidebarLink = ({
    to,
    end,
    label,
    icon: Icon,
    badge,
    onNavigate,
}) => {
    const displayedBadge = formatBadgeCount(badge);

    return (
        <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
                [
                    "group/link relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    isActive
                        ? "bg-brand-orange text-white shadow-lg shadow-orange-950/20"
                        : "text-theme-sidebar-text hover:bg-theme-surface/10 hover:text-white",
                ].join(" ")
            }
        >
            {({ isActive }) => (
                <>
                    <span
                        aria-hidden="true"
                        className={[
                            "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-theme-surface transition",
                            isActive ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                    />

                    <Icon
                        size={18}
                        className={[
                            "shrink-0 transition-colors",
                            isActive
                                ? "text-white"
                                : "text-theme-sidebar-muted group-hover/link:text-white",
                        ].join(" ")}
                    />

                    <span className="flex-1 truncate">{label}</span>

                    {displayedBadge && (
                        <span
                            className={[
                                "ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
                                isActive
                                    ? "bg-theme-surface text-brand-orange"
                                    : "bg-brand-orange text-white",
                            ].join(" ")}
                        >
                            {displayedBadge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
};

export const SidebarSubLink = ({
    to,
    label,
    icon: Icon,
    badge,
    onNavigate,
}) => {
    const displayedBadge = formatBadgeCount(badge);

    return (
        <NavLink
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
                [
                    "group/sub flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
                    isActive
                        ? "bg-brand-orange text-white"
                        : "text-theme-sidebar-muted hover:bg-theme-surface/10 hover:text-white",
                ].join(" ")
            }
        >
            {({ isActive }) => (
                <>
                    <span
                        className={[
                            "grid h-1.5 w-1.5 shrink-0 rounded-full transition",
                            isActive
                                ? "bg-theme-surface"
                                : "bg-theme-sidebar-muted group-hover/sub:bg-theme-surface",
                        ].join(" ")}
                    />

                    <Icon
                        size={14}
                        className={[
                            "shrink-0 transition-colors",
                            isActive
                                ? "text-white"
                                : "text-theme-sidebar-muted group-hover/sub:text-white",
                        ].join(" ")}
                    />

                    <span className="flex-1 truncate">{label}</span>

                    {displayedBadge && (
                        <span
                            className={[
                                "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
                                isActive
                                    ? "bg-theme-surface text-brand-orange"
                                    : "bg-brand-orange text-white",
                            ].join(" ")}
                        >
                            {displayedBadge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
};

export const CollapsedNavGroup = ({
    group,
    isActive,
    badge,
    childBadgeResolver,
    onNavigate,
}) => {
    const [hovered, setHovered] = useState(false);
    const closeTimer = useRef(null);
    const displayedBadge = formatBadgeCount(badge);

    const open = () => {
        if (closeTimer.current) {
            window.clearTimeout(closeTimer.current);
        }

        setHovered(true);
    };

    const close = () => {
        closeTimer.current = window.setTimeout(() => setHovered(false), 120);
    };

    useEffect(() => {
        return () => {
            if (closeTimer.current) {
                window.clearTimeout(closeTimer.current);
            }
        };
    }, []);

    return (
        <div className="relative" onMouseEnter={open} onMouseLeave={close}>
            <SidebarTooltip label={group.label}>
                <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={hovered}
                    className={[
                        "relative flex w-full items-center justify-center rounded-xl p-2.5 transition",
                        isActive
                            ? "bg-brand-orange text-white shadow-lg shadow-orange-950/20"
                            : "text-theme-sidebar-muted hover:bg-theme-surface/10 hover:text-white",
                    ].join(" ")}
                >
                    <group.icon size={18} />

                    {displayedBadge && (
                        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white">
                            {displayedBadge}
                        </span>
                    )}
                </button>
            </SidebarTooltip>

            {hovered && (
                <div
                    role="menu"
                    className="absolute left-full top-0 z-50 ml-2 w-60 origin-top-left rounded-xl border border-line bg-theme-surface p-2 shadow-xl"
                >
                    <p className="flex items-center gap-2 px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-brand-green">
                        <span>{group.label}</span>
                        <span className="h-px flex-1 bg-line" />
                    </p>

                    {group.children.map((child) => (
                        <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={onNavigate}
                            className={({ isActive: childIsActive }) =>
                                [
                                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                                    childIsActive
                                        ? "bg-brand-orange text-white"
                                        : "text-brand-green hover:bg-theme-surface-soft hover:text-brand-green",
                                ].join(" ")
                            }
                        >
                            <child.icon size={14} />
                            <span className="flex-1 truncate">
                                {child.label}
                            </span>

                            {formatBadgeCount(childBadgeResolver(child)) && (
                                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-orange px-1.5 text-[10px] font-bold text-white">
                                    {formatBadgeCount(
                                        childBadgeResolver(child)
                                    )}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SidebarQuickAction = ({ to, label, icon: Icon }) => {
    return (
        <Link
            to={to}
            className="group flex items-center gap-2 rounded-xl border border-dashed border-brand-orange/35 bg-brand-orange/10 px-3 py-2.5 text-xs font-bold text-brand-orange transition hover:border-brand-orange hover:bg-brand-orange hover:text-white"
        >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-orange text-white transition group-hover:bg-theme-surface group-hover:text-brand-orange">
                <Icon size={11} />
            </span>

            {label}
        </Link>
    );
};

export const SidebarMiniStats = () => {
    return (
        <div className="rounded-xl border border-line bg-theme-page p-3">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                    Workspace
                </p>

                <span className="flex items-center gap-1 text-[10px] font-semibold text-theme-success-text">
                    <span className="relative grid h-1.5 w-1.5 place-items-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-60" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-brand-green" />
                    </span>
                    Live
                </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-content-secondary">
                Products & website content
            </p>
            <p className="mt-1 text-[10px] text-content-muted">
                Manage catalog listings and public pages.
            </p>
        </div>
    );
};

export const SidebarHelpCard = () => {
    return (
        <div className="mt-4 rounded-xl border border-white/15 bg-theme-surface/10 p-3">
            <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-orange text-white">
                    <HelpCircle size={13} />
                </span>

                <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Need help?</p>

                    <p className="truncate text-[11px] text-theme-sidebar-muted">
                        Browse admin docs & guides.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const SidebarSystemStatus = () => {
    return (
        <div className="flex items-center justify-between rounded-lg border border-line bg-theme-surface px-2.5 py-1.5 text-[10px] font-semibold text-content-muted">
            <span className="flex items-center gap-1.5">
                <Activity size={11} className="text-brand-green" />
                All systems normal
            </span>

            <span>v1.0.0</span>
        </div>
    );
};
