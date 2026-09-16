import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

import AdminHeader from "./admin/AdminHeader";
import AdminSidebar from "./admin/AdminSidebar";
import AdminUserPanel from "./admin/AdminUserPanel";
import QuickSearchModal from "./admin/QuickSearchModal";

import { deriveCrumbs } from "./admin/adminLayoutUtils";
import useAdminLayoutData from "./admin/useAdminLayoutData";
import useLocalStorage from "./admin/useLocalStorage";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [quickSearchOpen, setQuickSearchOpen] = useState(false);
    const [activeUserPanel, setActiveUserPanel] = useState(null);

    const [collapsed, setCollapsed] = useLocalStorage(
        "banmix-admin-sidebar-collapsed",
        false
    );

    const [autoRefreshEnabled, setAutoRefreshEnabled] = useLocalStorage(
        "banmix-admin-auto-refresh",
        true
    );

    const { posts, activityLoading, activityError } = useAdminLayoutData({
        locationPath: location.pathname,
        autoRefreshEnabled,
    });

    useEffect(() => {
        setMobileSidebarOpen(false);
        setQuickSearchOpen(false);
        setActiveUserPanel(null);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileSidebarOpen) {
            return undefined;
        }

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMobileSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [mobileSidebarOpen]);

    useEffect(() => {
        const handleQuickSearchShortcut = (event) => {
            const isShortcut =
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k";

            if (!isShortcut) {
                return;
            }

            event.preventDefault();
            setActiveUserPanel(null);
            setQuickSearchOpen(true);
        };

        window.addEventListener("keydown", handleQuickSearchShortcut);

        return () => {
            window.removeEventListener("keydown", handleQuickSearchShortcut);
        };
    }, []);

    const handleOpenQuickSearch = () => {
        setActiveUserPanel(null);
        setQuickSearchOpen(true);
    };

    const handleOpenUserPanel = (panel) => {
        setQuickSearchOpen(false);
        setActiveUserPanel(panel);
    };

    const handleQuickSearchNavigate = (path) => {
        setQuickSearchOpen(false);
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();
            navigate("/admin/login", { replace: true });
        } finally {
            setLoggingOut(false);
        }
    };

    const crumbs = useMemo(
        () => deriveCrumbs(location.pathname),
        [location.pathname]
    );

    const currentPage = crumbs[crumbs.length - 1];
    const mainLeftPadding = collapsed ? "lg:pl-20" : "lg:pl-80";

    return (
        <div className="min-h-screen bg-theme-page">
            <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
                <AdminSidebar
                    collapsed={collapsed}
                    onClose={() => setMobileSidebarOpen(false)}
                    onToggleCollapse={() => setCollapsed((current) => !current)}
                    isMobile={false}
                    user={user}
                    onLogout={handleLogout}
                    loggingOut={loggingOut}
                    locationPath={location.pathname}
                />
            </div>

            <div
                className={[
                    "fixed inset-0 z-50 lg:hidden",
                    mobileSidebarOpen
                        ? "pointer-events-auto"
                        : "pointer-events-none",
                ].join(" ")}
                aria-hidden={!mobileSidebarOpen}
            >
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={[
                        "absolute inset-0 bg-theme-page/50 backdrop-blur-sm transition-opacity duration-300",
                        mobileSidebarOpen ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                />

                <div
                    className={[
                        "absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out",
                        mobileSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full",
                    ].join(" ")}
                >
                    <AdminSidebar
                        collapsed={false}
                        onClose={() => setMobileSidebarOpen(false)}
                        onToggleCollapse={() => {}}
                        isMobile
                        user={user}
                        onLogout={handleLogout}
                        loggingOut={loggingOut}
                        locationPath={location.pathname}
                    />
                </div>
            </div>

            <div
                className={[
                    "min-h-screen transition-[padding] duration-200",
                    mainLeftPadding,
                ].join(" ")}
            >
                <AdminHeader
                    crumbs={crumbs}
                    currentPage={currentPage}
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                    onOpenSearch={handleOpenQuickSearch}
                    user={user}
                    onLogout={handleLogout}
                    loggingOut={loggingOut}
                    onOpenUserPanel={handleOpenUserPanel}
                />

                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            <QuickSearchModal
                open={quickSearchOpen}
                onClose={() => setQuickSearchOpen(false)}
                loading={activityLoading}
                error={activityError}
                posts={posts}
                onNavigate={handleQuickSearchNavigate}
            />

            <AdminUserPanel
                panel={activeUserPanel}
                onClose={() => setActiveUserPanel(null)}
                user={user}
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
                autoRefreshEnabled={autoRefreshEnabled}
                onAutoRefreshChange={setAutoRefreshEnabled}
                onNavigate={navigate}
                onOpenQuickSearch={handleOpenQuickSearch}
            />
        </div>
    );
};

export default AdminLayout;
