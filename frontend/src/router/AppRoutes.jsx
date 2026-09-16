import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import RoleRoute from "../auth/RoleRoute";

import PublicLayout from "../components/layouts/PublicLayout";
import AdminLayout from "../components/layouts/AdminLayout";
import PostDetails from "../pages/admin/PostDetails";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Login from "../pages/public/Login";
import Products from "../pages/public/Products";
import ProductDetails from "../pages/public/ProductDetails";
import Services from "../pages/public/Services";
import Events from "../pages/public/Events";
import Gallery from "../pages/public/Gallery";
import Contact from "../pages/public/Contact";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AllPosts from "../pages/admin/AllPosts";
import SiteContents from "../pages/admin/SiteContents";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                <Route path="/admin/login" element={<Login />} />
                <Route path="/login" element={<Navigate to="/admin/login" replace />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="posts" element={<AllPosts />} />
                            <Route path="posts/:id" element={<PostDetails />} />
                            <Route
                                path="site-contents"
                                element={<SiteContents />}
                            />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
