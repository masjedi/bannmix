import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

import { AdminBreadcrumbProvider } from "./admin/AdminBreadcrumbContext";
import AdminHeader from "./admin/AdminHeader";
import AdminSidebar from "./admin/AdminSidebar";
import AdminUserPanel from "./admin/AdminUserPanel";
import QuickSearchModal from "./admin/QuickSearchModal";

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

    const {
        posts,
        postStats,
        activityLoading,
        activityError,
        refetchPosts,
        loadQuickSearchPosts,
    } = useAdminLayoutData({
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
            loadQuickSearchPosts?.();
        };

        window.addEventListener("keydown", handleQuickSearchShortcut);

        return () => {
            window.removeEventListener("keydown", handleQuickSearchShortcut);
        };
    }, []);

    const handleOpenQuickSearch = () => {
        setActiveUserPanel(null);
        setQuickSearchOpen(true);
        loadQuickSearchPosts?.();
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

    return (
        <AdminBreadcrumbProvider>
        <div className="admin-shell min-h-screen">
            <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
                <AdminSidebar
                    onClose={() => setMobileSidebarOpen(false)}
                    isMobile={false}
                    onLogout={handleLogout}
                    loggingOut={loggingOut}
                    productCount={postStats?.total ?? posts.length}
                    onOpenPanel={handleOpenUserPanel}
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
                        "absolute inset-0 bg-theme-modal-backdrop/35 backdrop-blur-sm transition-opacity duration-300",
                        mobileSidebarOpen ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                />

                <div
                    className={[
                        "absolute inset-y-0 left-0 w-[min(280px,88vw)] shadow-2xl transition-transform duration-300 ease-out",
                        mobileSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full",
                    ].join(" ")}
                >
                    <AdminSidebar
                        onClose={() => setMobileSidebarOpen(false)}
                        isMobile
                        onLogout={handleLogout}
                        loggingOut={loggingOut}
                        productCount={postStats?.total ?? posts.length}
                        onOpenPanel={handleOpenUserPanel}
                    />
                </div>
            </div>

            <div className="admin-main min-h-screen lg:pl-[260px]">
                <AdminHeader
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                    onOpenSearch={handleOpenQuickSearch}
                    user={user}
                    onLogout={handleLogout}
                    loggingOut={loggingOut}
                    onOpenUserPanel={handleOpenUserPanel}
                />

                <main className="admin-main-content">
                    <Outlet
                        context={{
                            posts,
                            postStats,
                            activityLoading,
                            activityError,
                            refetchPosts,
                        }}
                    />
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
        </AdminBreadcrumbProvider>
    );
};

export default AdminLayout;
