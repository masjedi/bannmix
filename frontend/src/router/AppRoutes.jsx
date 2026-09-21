import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "./ScrollToTop";

import ProtectedRoute from "../auth/ProtectedRoute";
import RoleRoute from "../auth/RoleRoute";
import RouteLoadingFallback from "../components/RouteLoadingFallback";

import PublicLayout from "../components/layouts/PublicLayout";
import AdminLayout from "../components/layouts/AdminLayout";

const Home = lazy(() => import("../pages/public/Home"));
const About = lazy(() => import("../pages/public/About"));
const Login = lazy(() => import("../pages/public/Login"));
const Products = lazy(() => import("../pages/public/Products"));
const ProductDetails = lazy(() => import("../pages/public/ProductDetails"));
const Services = lazy(() => import("../pages/public/Services"));
const Events = lazy(() => import("../pages/public/Events"));
const EventDetails = lazy(() => import("../pages/public/EventDetails"));
const Gallery = lazy(() => import("../pages/public/Gallery"));
const Contact = lazy(() => import("../pages/public/Contact"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AllPosts = lazy(() => import("../pages/admin/AllPosts"));
const PostDetails = lazy(() => import("../pages/admin/PostDetails"));
const SiteContents = lazy(() => import("../pages/admin/SiteContents"));
const ContactMessages = lazy(() => import("../pages/admin/ContactMessages"));
const SiteFeedbackPage = lazy(() => import("../pages/admin/SiteFeedback"));

const withSuspense = (element) => (
    <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>
);

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={withSuspense(<Home />)} />
                    <Route path="/about" element={withSuspense(<About />)} />
                    <Route
                        path="/products"
                        element={withSuspense(<Products />)}
                    />
                    <Route
                        path="/products/:id"
                        element={withSuspense(<ProductDetails />)}
                    />
                    <Route
                        path="/services"
                        element={withSuspense(<Services />)}
                    />
                    <Route path="/events" element={withSuspense(<Events />)} />
                    <Route
                        path="/events/:id"
                        element={withSuspense(<EventDetails />)}
                    />
                    <Route
                        path="/gallery"
                        element={withSuspense(<Gallery />)}
                    />
                    <Route
                        path="/contact"
                        element={withSuspense(<Contact />)}
                    />
                </Route>

                <Route path="/admin/login" element={withSuspense(<Login />)} />
                <Route
                    path="/login"
                    element={<Navigate to="/admin/login" replace />}
                />

                <Route element={<ProtectedRoute />}>
                    <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route
                                index
                                element={withSuspense(<AdminDashboard />)}
                            />
                            <Route
                                path="posts"
                                element={withSuspense(<AllPosts />)}
                            />
                            <Route
                                path="posts/:id"
                                element={withSuspense(<PostDetails />)}
                            />
                            <Route
                                path="site-contents"
                                element={withSuspense(<SiteContents />)}
                            />
                            <Route
                                path="contact-messages"
                                element={withSuspense(<ContactMessages />)}
                            />
                            <Route
                                path="feedback"
                                element={withSuspense(<SiteFeedbackPage />)}
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
