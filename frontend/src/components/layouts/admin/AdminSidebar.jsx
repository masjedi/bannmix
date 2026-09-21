import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ExternalLink, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import BrandLogo from "../../BrandLogo";

import { getWebsitePageDefaultSection } from "../../admin/siteContent/siteContentFormSchemas";
import {
    buildSiteContentLink,
    SIDEBAR_NAV_GROUPS,
} from "./adminLayoutConfig";
import {
    formatBadgeCount,
    isSiteContentNavActive,
} from "./adminLayoutUtils";

const resolveItemLink = (item) => {
    if (item.type === "route" || item.to) {
        return item.to;
    }

    if (item.type === "home") {
        return buildSiteContentLink("home", item.section);
    }

    if (item.type === "page") {
        return buildSiteContentLink(
            item.page,
            getWebsitePageDefaultSection(item.page)
        );
    }

    return "/admin";
};

const isNavItemActive = (item, pathname, search) => {
    if (item.type === "action") {
        return false;
    }

    if (item.type === "route" || item.to) {
        return item.end
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
    }

    if (item.type === "home") {
        return isSiteContentNavActive(pathname, search, "home", item.section);
    }

    if (item.type === "page") {
        if (pathname !== "/admin/site-contents") {
            return false;
        }

        const params = new URLSearchParams(search);
        return params.get("page") === item.page;
    }

    if (item.to === "/admin/site-contents") {
        return (
            pathname === "/admin/site-contents" &&
            !new URLSearchParams(search).get("page")
        );
    }

    return false;
};

const groupContainsActiveItem = (group, pathname, search) => {
    const allItems = group.items
        ? group.items
        : (group.subgroups || []).flatMap((subgroup) => subgroup.items);

    return allItems.some((item) => isNavItemActive(item, pathname, search));
};

const AdminSidebar = ({
    onClose,
    isMobile,
    onLogout,
    loggingOut = false,
    productCount = 0,
    onOpenPanel,
}) => {
    const location = useLocation();
    const { pathname, search } = location;

    const defaultOpenGroups = useMemo(() => {
        const open = {};

        SIDEBAR_NAV_GROUPS.forEach((group) => {
            open[group.key] = groupContainsActiveItem(group, pathname, search);
        });

        return open;
    }, [pathname, search]);

    const [openGroups, setOpenGroups] = useState(defaultOpenGroups);

    useEffect(() => {
        setOpenGroups((current) => ({
            ...current,
            ...defaultOpenGroups,
        }));
    }, [defaultOpenGroups]);

    const onNavigate = () => {
        if (isMobile) {
            onClose();
        }
    };

    const resolveBadge = (item) => {
        if (item.badgeKey === "products" && productCount > 0) {
            return formatBadgeCount(productCount);
        }

        return null;
    };

    const toggleGroup = (groupKey) => {
        setOpenGroups((current) => ({
            ...current,
            [groupKey]: !current[groupKey],
        }));
    };

    const handleGeneralAction = (action) => {
        if (action === "logout") {
            onLogout();
            return;
        }

        if (action === "settings" || action === "help") {
            onOpenPanel?.(action);
        }

        onNavigate();
    };

    const renderNavLink = (item, nested = true) => {
        if (item.type === "action") {
            const Icon = item.icon;
            const isLogout = item.action === "logout";

            return (
                <li key={item.label}>
                    <button
                        type="button"
                        onClick={() => handleGeneralAction(item.action)}
                        disabled={isLogout && loggingOut}
                        className={[
                            "admin-sidebar-link admin-sidebar-link-button",
                            nested ? "admin-sidebar-link-nested" : "",
                            isLogout ? "admin-sidebar-link-logout" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        <Icon
                            size={18}
                            strokeWidth={1.9}
                            className="admin-sidebar-link-icon"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {isLogout && loggingOut
                                ? "Logging out…"
                                : item.label}
                        </span>
                    </button>
                </li>
            );
        }

        const Icon = item.icon;
        const to = resolveItemLink(item);
        const isActive = isNavItemActive(item, pathname, search);
        const badge = resolveBadge(item);

        return (
            <li key={`${item.label}-${to}`}>
                <NavLink
                    to={to}
                    end={item.end}
                    onClick={onNavigate}
                    className={[
                        "admin-sidebar-link",
                        nested ? "admin-sidebar-link-nested" : "",
                        isActive ? "is-active" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <Icon
                        size={nested ? 16 : 18}
                        strokeWidth={1.9}
                        className="admin-sidebar-link-icon"
                        aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                    {badge ? (
                        <span className="admin-sidebar-badge">{badge}</span>
                    ) : null}
                </NavLink>
            </li>
        );
    };

    const renderSubgroup = (subgroup) => (
        <div key={subgroup.key} className="admin-sidebar-subgroup">
            <p className="admin-sidebar-subgroup-label">{subgroup.label}</p>
            <ul className="admin-sidebar-list">
                {subgroup.items.map((item) => renderNavLink(item, true))}
            </ul>
        </div>
    );

    const renderGroup = (group) => {
        const isOpen = Boolean(openGroups[group.key]);
        const isActiveGroup = groupContainsActiveItem(group, pathname, search);

        return (
            <nav
                key={group.key}
                aria-label={group.label}
                className={[
                    "admin-sidebar-group",
                    isOpen ? "is-open" : "",
                    isActiveGroup ? "has-active" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <button
                    type="button"
                    className={[
                        "admin-sidebar-group-toggle",
                        isActiveGroup ? "is-active" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(group.key)}
                >
                    <span className="admin-sidebar-group-heading">
                        {group.label}
                    </span>
                    <ChevronDown
                        size={15}
                        className={[
                            "admin-sidebar-group-chevron",
                            isOpen ? "is-open" : "",
                        ].join(" ")}
                        aria-hidden="true"
                    />
                </button>

                <div
                    className={[
                        "admin-sidebar-group-panel",
                        isOpen ? "is-open" : "",
                    ].join(" ")}
                >
                    <div className="admin-sidebar-group-body">
                        {group.subgroups?.length ? (
                            group.subgroups.map(renderSubgroup)
                        ) : (
                            <ul className="admin-sidebar-list">
                                {(group.items || []).map((item) =>
                                    renderNavLink(item, group.key !== "overview")
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </nav>
        );
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-brand">
                <Link
                    to="/admin"
                    onClick={onNavigate}
                    className="admin-sidebar-brand-link"
                    aria-label="BanMix Admin"
                >
                    <span className="admin-sidebar-brand-mark">
                        <BrandLogo mark className="h-8 w-8" />
                    </span>
                    <span className="admin-sidebar-brand-name">BanMix</span>
                </Link>

                {isMobile ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-sidebar-close"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                ) : null}
            </div>

            <div className="admin-sidebar-scroll">
                {SIDEBAR_NAV_GROUPS.map(renderGroup)}
            </div>

            <div className="admin-sidebar-promo">
                <div className="admin-sidebar-promo-glow" aria-hidden="true" />
                <p className="admin-sidebar-promo-title">
                    View the public website
                </p>
                <p className="admin-sidebar-promo-copy">
                    See how customers browse your catalog and content.
                </p>
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="admin-sidebar-promo-btn"
                >
                    Open site
                    <ExternalLink size={14} aria-hidden="true" />
                </a>
            </div>
        </aside>
    );
};

export default AdminSidebar;
