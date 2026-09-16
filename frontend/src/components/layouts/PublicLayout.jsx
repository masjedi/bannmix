import { Outlet } from "react-router-dom";

import PublicFooter from "../public/PublicFooter";
import PublicNavbar from "../public/PublicNavbar";

const PublicLayout = () => {
    return (
        <div className="public-layout flex min-h-screen flex-col">
            <PublicNavbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
