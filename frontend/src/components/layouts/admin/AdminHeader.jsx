import { useMemo } from "react";
import { Menu, MessageSquareMore, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

import ThemeToggle from "../../public/ThemeToggle";
import AdminBreadcrumb from "./AdminBreadcrumb";
import { useAdminBreadcrumbContext } from "./AdminBreadcrumbContext";
import { buildAdminBreadcrumbs } from "./adminLayoutUtils";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

const SearchButton = ({ onOpen }) => (
    <button
        type="button"
        onClick={onOpen}
        className="admin-header-search"
        aria-label="Quick search"
    >
        <Search size={16} className="admin-header-search-icon" aria-hidden="true" />
        <span className="admin-header-search-placeholder">Search admin…</span>
        <kbd className="admin-header-search-kbd">⌘ K</kbd>
    </button>
);

const AdminHeader = ({
    onOpenSidebar,
    onOpenSearch,
    user,
    onLogout,
    loggingOut,
    onOpenUserPanel,
}) => {
    const location = useLocation();
    const breadcrumbContext = useAdminBreadcrumbContext();

    const breadcrumbItems = useMemo(() => {
        if (breadcrumbContext?.customItems?.length) {
            return breadcrumbContext.customItems;
        }

        return buildAdminBreadcrumbs(location.pathname, location.search);
    }, [breadcrumbContext?.customItems, location.pathname, location.search]);

    return (
        <header className="admin-header">
            <div className="admin-header-main">
                <div className="admin-header-start">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="admin-header-icon-btn lg:hidden"
                        aria-label="Open sidebar"
                    >
                        <Menu size={18} />
                    </button>

                    <div className="admin-header-leading">
                        <AdminBreadcrumb items={breadcrumbItems} />

                        <SearchButton onOpen={onOpenSearch} />
                    </div>
                </div>

                <div className="admin-header-actions">
                    <button
                        type="button"
                        onClick={() => onOpenUserPanel("help")}
                        className="admin-header-icon-btn hidden sm:grid"
                        aria-label="Messages and support"
                    >
                        <MessageSquareMore size={17} />
                    </button>

                    <ThemeToggle variant="admin" />

                    <NotificationBell />

                    <UserMenu
                        user={user}
                        onLogout={onLogout}
                        loggingOut={loggingOut}
                        onOpenPanel={onOpenUserPanel}
                    />
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
