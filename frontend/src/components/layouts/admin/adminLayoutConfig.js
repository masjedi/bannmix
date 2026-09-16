import { FileText, Languages, LayoutDashboard } from "lucide-react";

/*
|--------------------------------------------------------------------------
| Client Management Routes
|--------------------------------------------------------------------------
|
| Kept for compatibility. Client-account routes are no longer in the admin nav.
|
*/

export const CLIENT_MANAGEMENT_ROUTES = [];

/*
|--------------------------------------------------------------------------
| Admin Navigation
|--------------------------------------------------------------------------
|
| `section` is used by the sidebar to render section labels.
|
*/

export const NAV_ITEMS = [
    {
        to: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        end: true,
        section: "overview",
        shortcut: "D",
    },

    {
        to: "/admin/posts",
        label: "Products",
        icon: FileText,
        section: "management",
    },

    {
        to: "/admin/site-contents",
        label: "Website Content",
        icon: Languages,
        section: "website",
    },
];

/*
|--------------------------------------------------------------------------
| Sidebar Section Labels
|--------------------------------------------------------------------------
*/

export const NAV_SECTIONS = [
    {
        key: "overview",
        label: "Overview",
    },

    {
        key: "management",
        label: "Management",
    },

    {
        key: "website",
        label: "Website Management",
    },
];

/*
|--------------------------------------------------------------------------
| Admin Quick Search Pages
|--------------------------------------------------------------------------
*/

export const QUICK_SEARCH_PAGES = [
    {
        key: "dashboard",
        title: "Dashboard",
        subtitle: "Admin overview",
        keywords: "home analytics activity",
        path: "/admin",
        icon: LayoutDashboard,
    },

    {
        key: "posts",
        title: "Products",
        subtitle: "Review and manage products",
        keywords: "products content posts listings",
        path: "/admin/posts",
        icon: FileText,
    },

    {
        key: "site-contents",
        title: "Website Content",
        subtitle: "Manage multilingual public website content",
        keywords:
            "website cms content pages sections translations languages home",
        path: "/admin/site-contents",
        icon: Languages,
    },
];
