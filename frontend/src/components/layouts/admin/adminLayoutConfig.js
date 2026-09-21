import { getWebsitePageDefaultSection } from "../../admin/siteContent/siteContentFormSchemas";

import {
    Award,
    BookOpen,
    CalendarDays,
    CircleHelp,
    FileText,
    HelpCircle,
    Images,
    Info,
    LayoutDashboard,
    LogOut,
    Mail,
    Megaphone,
    MessageSquareQuote,
    Package,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Store,
    Truck,
    Users,
    Video,
    Wrench,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Client Management Routes
|--------------------------------------------------------------------------
*/

export const CLIENT_MANAGEMENT_ROUTES = [];

/*
|--------------------------------------------------------------------------
| Site content deep links
|--------------------------------------------------------------------------
*/

export const buildSiteContentLink = (page, section = "") => {
    const params = new URLSearchParams();

    if (page) {
        params.set("page", page);
    }

    if (section) {
        params.set("section", section);
    }

    const query = params.toString();

    return query ? `/admin/site-contents?${query}` : "/admin/site-contents";
};

/*
|--------------------------------------------------------------------------
| Flat nav exports (quick search + helpers)
|--------------------------------------------------------------------------
*/

export const PRIMARY_NAV_ITEMS = [
    {
        to: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        end: true,
    },
    {
        to: "/admin/posts",
        label: "Products",
        icon: FileText,
        badgeKey: "products",
    },
];

/** @deprecated Use PRIMARY_NAV_ITEMS */
export const MENU_NAV_ITEMS = PRIMARY_NAV_ITEMS;

/** @deprecated Use PRIMARY_NAV_ITEMS */
export const NAV_ITEMS = PRIMARY_NAV_ITEMS;

export const HOME_SECTION_NAV_ITEMS = [
    {
        label: "Hero",
        section: "hero",
        icon: Sparkles,
        publicAnchor: "home-hero",
    },
    {
        label: "Trust Strip",
        section: "trust_strip",
        icon: ShieldCheck,
        publicAnchor: "home-trust-strip",
    },
    {
        label: "Our Majoon",
        section: "majoon",
        icon: Package,
        publicAnchor: "our-majoon",
    },
    {
        label: "Intro Video",
        section: "intro_video",
        icon: Video,
        publicAnchor: "home-intro-video",
    },
    {
        label: "Featured Products",
        to: "/admin/posts",
        icon: ShoppingBag,
        publicAnchor: "featured-products",
    },
    {
        label: "Quality & Ingredients",
        section: "quality",
        icon: Award,
        publicAnchor: "ingredients-quality",
    },
    {
        label: "Quality Points",
        section: "quality_points",
        icon: Award,
        publicAnchor: "ingredients-quality",
    },
    {
        label: "About Intro",
        section: "about_intro",
        icon: Info,
        publicAnchor: "home-about",
    },
    {
        label: "About Intro Points",
        section: "about_intro_points",
        icon: Info,
        publicAnchor: "home-about",
    },
    {
        label: "Who We Serve",
        section: "audience",
        icon: Users,
        publicAnchor: "who-we-serve",
    },
    {
        label: "Ordering Process",
        section: "ordering",
        icon: Store,
        publicAnchor: "wholesale-process",
    },
    {
        label: "Why BanMix",
        section: "highlights",
        icon: Star,
        publicAnchor: "home-highlights",
    },
    {
        label: "Distribution",
        section: "distribution",
        icon: Truck,
        publicAnchor: "distribution",
    },
    {
        label: "Testimonials",
        section: "testimonials",
        icon: MessageSquareQuote,
        publicAnchor: "home-testimonials",
    },
    {
        label: "FAQ",
        section: "faq",
        icon: CircleHelp,
        publicAnchor: "faq",
    },
];

export const PUBLIC_PAGE_NAV_ITEMS = [
    {
        label: "Home Overview",
        page: "home",
        publicPath: "/",
        icon: LayoutDashboard,
    },
    {
        label: "About",
        page: "about",
        publicPath: "/about",
        icon: Info,
    },
    {
        label: "Products Page",
        page: "products",
        publicPath: "/products",
        icon: Megaphone,
    },
    {
        label: "Services",
        page: "services",
        publicPath: "/services",
        icon: Wrench,
    },
    {
        label: "Events",
        page: "events",
        publicPath: "/events",
        icon: CalendarDays,
    },
    {
        label: "Gallery",
        page: "gallery",
        publicPath: "/gallery",
        icon: Images,
    },
    {
        label: "Contact",
        page: "contact",
        publicPath: "/contact",
        icon: Mail,
    },
    {
        label: "FAQ Page",
        page: "faq",
        publicPath: "/#faq",
        icon: CircleHelp,
    },
    {
        label: "All Content",
        to: "/admin/site-contents",
        icon: BookOpen,
    },
];

export const GENERAL_NAV_ITEMS = [
    {
        label: "Settings",
        icon: Settings,
        action: "settings",
    },
    {
        label: "Help",
        icon: HelpCircle,
        action: "help",
    },
    {
        label: "Logout",
        icon: LogOut,
        action: "logout",
    },
];

/*
|--------------------------------------------------------------------------
| Grouped sidebar navigation
|--------------------------------------------------------------------------
*/

export const SIDEBAR_NAV_GROUPS = [
    {
        key: "overview",
        label: "Overview",
        items: [
            {
                type: "route",
                to: "/admin",
                label: "Dashboard",
                icon: LayoutDashboard,
                end: true,
            },
        ],
    },
    {
        key: "catalog",
        label: "Catalog",
        items: [
            {
                type: "route",
                to: "/admin/posts",
                label: "Products",
                icon: FileText,
                badgeKey: "products",
            },
        ],
    },
    {
        key: "home-page",
        label: "Home Page",
        collapsible: true,
        subgroups: [
            {
                key: "home-intro",
                label: "Intro & Product",
                items: [
                    { type: "home", label: "Hero", section: "hero", icon: Sparkles },
                    {
                        type: "home",
                        label: "Trust Strip",
                        section: "trust_strip",
                        icon: ShieldCheck,
                    },
                    {
                        type: "home",
                        label: "Our Majoon",
                        section: "majoon",
                        icon: Package,
                    },
                    {
                        type: "home",
                        label: "Intro Video",
                        section: "intro_video",
                        icon: Video,
                    },
                    {
                        type: "route",
                        to: "/admin/posts",
                        label: "Featured Products",
                        icon: ShoppingBag,
                    },
                    {
                        type: "home",
                        label: "Quality & Ingredients",
                        section: "quality",
                        icon: Award,
                    },
                    {
                        type: "home",
                        label: "Quality Points",
                        section: "quality_points",
                        icon: Award,
                    },
                ],
            },
            {
                key: "home-story",
                label: "Story & Audience",
                items: [
                    {
                        type: "home",
                        label: "About Intro",
                        section: "about_intro",
                        icon: Info,
                    },
                    {
                        type: "home",
                        label: "About Intro Points",
                        section: "about_intro_points",
                        icon: Info,
                    },
                    {
                        type: "home",
                        label: "Who We Serve",
                        section: "audience",
                        icon: Users,
                    },
                    {
                        type: "home",
                        label: "Why BanMix",
                        section: "highlights",
                        icon: Star,
                    },
                ],
            },
            {
                key: "home-commerce",
                label: "Ordering & Reach",
                items: [
                    {
                        type: "home",
                        label: "Ordering Process",
                        section: "ordering",
                        icon: Store,
                    },
                    {
                        type: "home",
                        label: "Distribution",
                        section: "distribution",
                        icon: Truck,
                    },
                ],
            },
            {
                key: "home-updates",
                label: "Updates & Support",
                items: [
                    {
                        type: "home",
                        label: "Testimonials",
                        section: "testimonials",
                        icon: MessageSquareQuote,
                    },
                    {
                        type: "home",
                        label: "FAQ",
                        section: "faq",
                        icon: CircleHelp,
                    },
                ],
            },
        ],
    },
    {
        key: "website-pages",
        label: "Website Pages",
        collapsible: true,
        subgroups: [
            {
                key: "pages-company",
                label: "Company",
                items: [
                    {
                        type: "page",
                        label: "Home Overview",
                        page: "home",
                        icon: LayoutDashboard,
                    },
                    {
                        type: "page",
                        label: "About",
                        page: "about",
                        icon: Info,
                    },
                ],
            },
            {
                key: "pages-commerce",
                label: "Commerce",
                items: [
                    {
                        type: "page",
                        label: "Products Page",
                        page: "products",
                        icon: Megaphone,
                    },
                    {
                        type: "page",
                        label: "Services",
                        page: "services",
                        icon: Wrench,
                    },
                ],
            },
            {
                key: "pages-media",
                label: "Media",
                items: [
                    {
                        type: "page",
                        label: "Events",
                        page: "events",
                        icon: CalendarDays,
                    },
                    {
                        type: "page",
                        label: "Gallery",
                        page: "gallery",
                        icon: Images,
                    },
                ],
            },
            {
                key: "pages-support",
                label: "Support",
                items: [
                    {
                        type: "page",
                        label: "Contact",
                        page: "contact",
                        icon: Mail,
                    },
                    {
                        type: "route",
                        to: "/admin/contact-messages",
                        label: "Contact Inbox",
                        icon: Mail,
                    },
                    {
                        type: "route",
                        to: "/admin/feedback",
                        label: "Site Feedback",
                        icon: MessageSquareQuote,
                    },
                    {
                        type: "page",
                        label: "FAQ Page",
                        page: "faq",
                        icon: CircleHelp,
                    },
                ],
            },
            {
                key: "pages-cms",
                label: "Content Library",
                items: [
                    {
                        type: "route",
                        to: "/admin/site-contents",
                        label: "All Content",
                        icon: BookOpen,
                    },
                ],
            },
        ],
    },
    {
        key: "general",
        label: "General",
        items: GENERAL_NAV_ITEMS.map((item) => ({
            type: "action",
            ...item,
        })),
    },
];

export const NAV_SECTIONS = [
    { key: "overview", label: "Overview" },
    { key: "management", label: "Management" },
    { key: "website", label: "Website Management" },
];

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
        subtitle: "Review and manage product catalog",
        keywords: "products content posts listings catalog",
        path: "/admin/posts",
        icon: FileText,
    },
    {
        key: "site-contents",
        title: "All Website Content",
        subtitle: "Manage multilingual CMS entries",
        keywords: "website cms content pages sections translations languages",
        path: "/admin/site-contents",
        icon: BookOpen,
    },
    ...HOME_SECTION_NAV_ITEMS.filter((item) => item.section).map((item) => ({
        key: `home-${item.section}`,
        title: `Home · ${item.label}`,
        subtitle: "Edit home page section content",
        keywords: `home ${item.section} ${item.label} website content`,
        path: buildSiteContentLink("home", item.section),
        icon: item.icon,
    })),
    ...PUBLIC_PAGE_NAV_ITEMS.filter((item) => item.page).map((item) => ({
        key: `page-${item.page}`,
        title: item.label,
        subtitle: "Edit public page content",
        keywords: `${item.page} ${item.label} website page content`,
        path: buildSiteContentLink(item.page, getWebsitePageDefaultSection(item.page)),
        icon: item.icon,
    })),
];
