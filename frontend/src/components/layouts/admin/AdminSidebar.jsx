import { useEffect, useMemo, useState } from "react";

import {
    ChevronRight,
    FileText,
    Languages,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import BrandLogo from "../../BrandLogo";

import { NAV_ITEMS, NAV_SECTIONS } from "./adminLayoutConfig";
import {
    SidebarMiniStats,
    SidebarQuickAction,
    SidebarSystemStatus,
    SidebarTooltip,
} from "./AdminSidebarParts";

const AdminSidebar = ({
    collapsed,
    onClose,
    onToggleCollapse,
    isMobile,
    user,
    onLogout,
    loggingOut,
    locationPath,
}) => {
    const activeItem = useMemo(
        () =>
            NAV_ITEMS.find((item) => {
                if (item.children) {
                    return item.children.some((child) =>
                        locationPath.startsWith(child.to)
                    );
                }

                return item.end
                    ? locationPath === item.to
                    : locationPath.startsWith(item.to);
            }) || NAV_ITEMS[0],
        [locationPath]
    );

    const [selectedItemLabel, setSelectedItemLabel] = useState(
        activeItem?.label || ""
    );

    useEffect(() => {
        if (activeItem?.label) {
            setSelectedItemLabel(activeItem.label);
        }
    }, [activeItem?.label]);

    const selectedItem =
        NAV_ITEMS.find((item) => item.label === selectedItemLabel) ||
        activeItem ||
        NAV_ITEMS[0];

    const onNavigate = () => {
        if (isMobile) {
            onClose();
        }
    };

    const selectedSection = NAV_SECTIONS.find(
        (section) => section.key === selectedItem?.section
    );
    const SelectedIcon = selectedItem?.icon;
    const showDetails = isMobile || !collapsed;

    return (
        <aside
            className={[
                "flex h-full overflow-hidden border-r border-line bg-theme-surface font-sans text-content shadow-xl transition-[width] duration-300",
                showDetails ? "w-80" : "w-20",
            ].join(" ")}
        >
            <div className="flex w-20 shrink-0 flex-col items-center border-r border-line-strong bg-theme-sidebar">
                <div className="flex h-20 w-full items-center justify-center border-b border-white/15">
                    <SidebarTooltip label="BanMix Admin">
                        <NavLink
                            to="/admin"
                            onClick={onNavigate}
                            className="grid h-11 w-11 place-items-center rounded-xl bg-theme-surface shadow-lg transition hover:-translate-y-0.5"
                            aria-label="BanMix Admin"
                        >
                            <BrandLogo mark className="h-10 w-10" />
                        </NavLink>
                    </SidebarTooltip>
                </div>

                <nav className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {NAV_ITEMS.map((item) => {
                        const itemIsActive = activeItem?.label === item.label;
                        const Icon = item.icon;

                        if (item.children) {
                            return (
                                <SidebarTooltip
                                    key={item.label}
                                    label={item.label}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItemLabel(item.label);

                                            if (!isMobile && collapsed) {
                                                onToggleCollapse();
                                            }
                                        }}
                                        className={[
                                            "relative grid h-11 w-11 place-items-center rounded-xl transition",
                                            itemIsActive ||
                                            selectedItem?.label === item.label
                                                ? "bg-brand-orange text-white shadow-lg shadow-orange-950/20"
                                                : "text-theme-sidebar-muted hover:bg-theme-surface/10 hover:text-white",
                                        ].join(" ")}
                                        aria-label={item.label}
                                    >
                                        <Icon size={20} strokeWidth={1.8} />
                                    </button>
                                </SidebarTooltip>
                            );
                        }

                        return (
                            <SidebarTooltip key={item.to} label={item.label}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    onClick={onNavigate}
                                    className={({ isActive }) =>
                                        [
                                            "relative grid h-11 w-11 place-items-center rounded-xl transition",
                                            isActive
                                                ? "bg-brand-orange text-white shadow-lg shadow-orange-950/20"
                                                : "text-theme-sidebar-muted hover:bg-theme-surface/10 hover:text-white",
                                        ].join(" ")
                                    }
                                    aria-label={item.label}
                                >
                                    <Icon size={20} strokeWidth={1.8} />
                                </NavLink>
                            </SidebarTooltip>
                        );
                    })}
                </nav>

                <div className="flex w-full flex-col items-center gap-2 border-t border-white/15 px-3 py-4">
                    {!isMobile && (
                        <SidebarTooltip
                            label={
                                collapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                className="grid h-10 w-10 place-items-center rounded-xl text-theme-sidebar-muted transition hover:bg-theme-surface/10 hover:text-white"
                                aria-label={
                                    collapsed
                                        ? "Expand sidebar"
                                        : "Collapse sidebar"
                                }
                            >
                                {collapsed ? (
                                    <PanelLeftOpen size={19} />
                                ) : (
                                    <PanelLeftClose size={19} />
                                )}
                            </button>
                        </SidebarTooltip>
                    )}

                    <SidebarTooltip label="Log out">
                        <button
                            type="button"
                            onClick={onLogout}
                            disabled={loggingOut}
                            className="grid h-10 w-10 place-items-center rounded-xl text-theme-sidebar-muted transition hover:bg-brand-orange hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Log out"
                        >
                            <LogOut size={18} />
                        </button>
                    </SidebarTooltip>
                </div>
            </div>

            {showDetails && (
                <div className="flex min-w-0 flex-1 flex-col bg-theme-surface">
                    <div className="flex h-20 items-center justify-between border-b border-line px-5">
                        <div className="min-w-0">
                            <p className="truncate text-base font-bold text-content">
                                BanMix Admin
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green">
                                Management panel
                            </p>
                        </div>

                        {isMobile && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="grid h-9 w-9 place-items-center rounded-lg text-content-muted transition hover:bg-theme-surface-soft hover:text-content"
                                aria-label="Close menu"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="mb-5 space-y-2">
                            <SidebarQuickAction
                                to="/admin/posts"
                                label="Manage products"
                                icon={FileText}
                            />
                            <SidebarQuickAction
                                to="/admin/site-contents"
                                label="Edit website content"
                                icon={Languages}
                            />
                        </div>

                        <div className="mb-3 px-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-content-muted">
                                {selectedSection?.label || "Navigation"}
                            </p>
                            <h2 className="mt-1 truncate text-lg font-extrabold text-content">
                                {selectedItem?.label || "Admin"}
                            </h2>
                        </div>

                        <nav className="space-y-1">
                            {selectedItem?.children?.map((child) => {
                                const ChildIcon = child.icon;

                                return (
                                    <NavLink
                                        key={child.to}
                                        to={child.to}
                                        onClick={onNavigate}
                                        className={({ isActive }) =>
                                            [
                                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                                                isActive
                                                    ? "bg-brand-orange/10 text-brand-orange"
                                                    : "text-content-secondary hover:bg-theme-page hover:text-content",
                                            ].join(" ")
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span
                                                    className={[
                                                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition",
                                                        isActive
                                                            ? "bg-brand-orange text-white"
                                                            : "bg-theme-surface-soft text-content-muted group-hover:bg-theme-surface-soft group-hover:text-brand-green",
                                                    ].join(" ")}
                                                >
                                                    <ChildIcon
                                                        size={16}
                                                        strokeWidth={1.8}
                                                    />
                                                </span>
                                                <span className="min-w-0 flex-1 truncate">
                                                    {child.label}
                                                </span>
                                                <ChevronRight
                                                    size={15}
                                                    className="text-content-muted transition group-hover:translate-x-0.5 group-hover:text-content-muted"
                                                />
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}

                            {!selectedItem?.children && selectedItem && (
                                <NavLink
                                    to={selectedItem.to}
                                    end={selectedItem.end}
                                    onClick={onNavigate}
                                    className="flex items-center gap-3 rounded-xl bg-brand-orange/10 px-3 py-2.5 text-sm font-semibold text-brand-orange"
                                >
                                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-orange text-white">
                                        {SelectedIcon && (
                                            <SelectedIcon
                                                size={16}
                                                strokeWidth={1.8}
                                            />
                                        )}
                                    </span>
                                    <span className="flex-1 truncate">
                                        {selectedItem.label}
                                    </span>
                                    <ChevronRight size={15} />
                                </NavLink>
                            )}
                        </nav>
                    </div>

                    <div className="border-t border-line p-4">
                        <SidebarMiniStats />

                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-theme-page px-3 py-3">
                            <span className="relative shrink-0">
                                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-orange text-sm font-bold text-white">
                                    {(
                                        user?.name?.charAt(0) ||
                                        user?.email?.charAt(0) ||
                                        "A"
                                    ).toUpperCase()}
                                </span>
                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-green" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-content">
                                    {user?.name || "Administrator"}
                                </p>
                                <p className="truncate text-xs text-content-muted">
                                    {user?.email || "admin@banmix.com"}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="grid h-8 w-8 place-items-center rounded-lg text-content-muted transition hover:bg-theme-surface hover:text-brand-green"
                                aria-label="Settings"
                            >
                                <Settings size={15} />
                            </button>
                        </div>

                        <div className="mt-3">
                            <SidebarSystemStatus />
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default AdminSidebar;
