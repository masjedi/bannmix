import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RoleRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-theme-page">
                <p className="text-sm font-semibold text-content-secondary">
                    Checking authorization...
                </p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    const role = user.role || user.type;

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
