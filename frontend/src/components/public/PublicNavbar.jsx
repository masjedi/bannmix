import { useEffect, useRef, useState } from "react";



import { Link, NavLink, useLocation } from "react-router-dom";



import { Menu, ShoppingBag, X } from "lucide-react";



import BrandLogo from "../BrandLogo";

import LanguageSwitcher from "./LanguageSwitcher";

import ThemeToggle from "./ThemeToggle";

import { Container } from "./ui";

import { useLanguage } from "../../context/LanguageContext";

import { useTheme } from "../../context/ThemeContext";

import publicTranslations, {

    ORDER_CONTACTS,

} from "../../i18n/publicTranslations";



const PublicNavbar = () => {

    const location = useLocation();

    const { translate } = useLanguage();

    const { isDark } = useTheme();



    const [scrolled, setScrolled] = useState(false);

    const [mobileOpen, setMobileOpen] = useState(false);

    const drawerRef = useRef(null);



    useEffect(() => {

        setMobileOpen(false);

    }, [location.pathname]);



    useEffect(() => {

        const handleScroll = () => setScrolled(window.scrollY > 8);

        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);

    }, []);



    useEffect(() => {

        if (!mobileOpen) return undefined;



        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {

            if (event.key === "Escape") setMobileOpen(false);

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {

            document.body.style.overflow = "";

            window.removeEventListener("keydown", handleKeyDown);

        };

    }, [mobileOpen]);



    const orderHref = `https://wa.me/${ORDER_CONTACTS.whatsapp}?text=${encodeURIComponent(

        translate({

            en: "Hello BanMix, I would like to order Majoon for my shop.",

            ps: "سلام BanMix، زه غواړم د خپل دوکان لپاره معجون فرمایش ورکړم.",

            fa: "سلام BanMix، می‌خواهم برای فروشگاهم معجون سفارش دهم.",

        })

    )}`;



    const navItems = [

        {

            to: "/",

            label: translate(publicTranslations.navigation.home),

            end: true,

        },

        {

            to: "/about",

            label: translate(publicTranslations.navigation.about),

        },

        {

            to: "/products",

            label: translate(publicTranslations.navigation.products),

        },

        {

            to: "/services",

            label: translate(publicTranslations.navigation.services),

        },

        {

            to: "/events",

            label: translate(publicTranslations.navigation.events),

        },

        {

            to: "/gallery",

            label: translate(publicTranslations.navigation.gallery),

        },

        {

            to: "/contact",

            label: translate(publicTranslations.navigation.contact),

        },

    ];



    const navLinkClass = ({ isActive }) =>

        [

            "public-nav-link type-nav relative inline-flex h-10 items-center px-1 transition duration-200 ease-premium",

            "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-brand-blue after:transition-transform after:duration-200 after:ease-premium",

            isActive

                ? "is-active text-brand-blue after:scale-x-100"

                : "text-content-secondary after:scale-x-0 hover:text-brand-blue hover:after:scale-x-100",

        ].join(" ");



    return (

        <>

            <header

                className={[

                    "public-site-header",

                    scrolled ? "is-scrolled" : "",

                ].join(" ")}

            >

                <Container className="flex h-[68px] items-center justify-between gap-4 lg:h-[72px]">

                    <Link

                        to="/"

                        className="flex shrink-0 items-center"

                        aria-label={translate(

                            publicTranslations.header.homeLabel

                        )}

                    >

                        <BrandLogo className="w-[118px] sm:w-[132px]" />

                    </Link>



                    <nav

                        className="hidden items-center gap-6 xl:flex"

                        aria-label={translate(

                            publicTranslations.navigation.primaryLabel

                        )}

                    >

                        {navItems.map((item) => (

                            <NavLink

                                key={item.to}

                                to={item.to}

                                end={item.end}

                                className={navLinkClass}

                            >

                                {item.label}

                            </NavLink>

                        ))}

                    </nav>



                    <div className="flex items-center gap-2 sm:gap-3">

                        <ThemeToggle />

                        <div className="hidden sm:block">

                            <LanguageSwitcher compact />

                        </div>



                        <a

                            href={orderHref}

                            target="_blank"

                            rel="noreferrer noopener"

                            className="btn-primary hidden h-10 px-4 text-[13px] sm:inline-flex"

                        >

                            <ShoppingBag size={14} />

                            {translate(publicTranslations.header.orderNow)}

                        </a>



                        <button

                            type="button"

                            onClick={() => setMobileOpen(true)}

                            aria-label={translate(

                                publicTranslations.header.openMenu

                            )}

                            aria-expanded={mobileOpen}

                            aria-controls="mobile-menu"

                            className="icon-btn h-10 w-10 xl:hidden"

                        >

                            <Menu size={18} />

                        </button>

                    </div>

                </Container>

            </header>



            <div

                id="mobile-menu"

                ref={drawerRef}

                className={[

                    "fixed inset-0 z-[60] xl:hidden",

                    mobileOpen ? "pointer-events-auto" : "pointer-events-none",

                ].join(" ")}

                aria-hidden={!mobileOpen}

            >

                <button

                    type="button"

                    aria-label={translate(

                        publicTranslations.header.closeBackdrop

                    )}

                    onClick={() => setMobileOpen(false)}

                    className={[

                        "modal-backdrop absolute inset-0 backdrop-blur-[2px] transition-opacity duration-200 ease-premium",

                        mobileOpen ? "opacity-100" : "opacity-0",

                    ].join(" ")}

                />



                <aside

                    className={[

                        "mobile-nav-drawer absolute inset-x-0 top-0 max-h-[92vh] overflow-y-auto rounded-b-2xl shadow-card-hover transition-all duration-200 ease-premium",

                        mobileOpen

                            ? "translate-y-0 opacity-100"

                            : "-translate-y-3 opacity-0",

                    ].join(" ")}

                >

                    <div className="flex h-[68px] items-center justify-between bg-theme-surface-soft px-4">

                        <BrandLogo className="w-[118px]" />

                        <div className="flex items-center gap-2">

                            <ThemeToggle />

                            <button

                                type="button"

                                onClick={() => setMobileOpen(false)}

                                aria-label={translate(

                                    publicTranslations.header.closeMenu

                                )}

                                className="icon-btn h-10 w-10"

                            >

                                <X size={18} />

                            </button>

                        </div>

                    </div>



                    <div className="space-y-4 px-4 py-4">

                        <div className="flex items-center justify-between rounded-card bg-theme-surface-soft px-3 py-2.5">

                            <div>

                                <p className="text-xs font-semibold text-content">

                                    {translate(

                                        publicTranslations.header.languageTitle

                                    )}

                                </p>

                                <p className="mt-0.5 text-[11px] text-content-muted">

                                    {translate(

                                        publicTranslations.header

                                            .languageDescription

                                    )}

                                </p>

                            </div>

                            <LanguageSwitcher />

                        </div>



                        <nav

                            aria-label={translate(

                                publicTranslations.navigation.mobileLabel

                            )}

                        >

                            <ul className="space-y-1">

                                {navItems.map((item) => (

                                    <li key={item.to}>

                                        <NavLink

                                            to={item.to}

                                            end={item.end}

                                            className={({ isActive }) =>

                                                [

                                                    "flex min-h-11 items-center rounded-btn px-3 text-sm font-semibold transition duration-200",

                                                    isActive

                                                        ? "bg-brand-blue/10 text-brand-blue"

                                                        : "text-content hover:bg-theme-surface-soft",

                                                ].join(" ")

                                            }

                                        >

                                            {item.label}

                                        </NavLink>

                                    </li>

                                ))}

                            </ul>

                        </nav>



                        <a

                            href={orderHref}

                            target="_blank"

                            rel="noreferrer noopener"

                            className="btn-primary w-full"

                        >

                            <ShoppingBag size={15} />

                            {translate(publicTranslations.header.orderNow)}

                        </a>

                    </div>

                </aside>

            </div>

        </>

    );

};



export default PublicNavbar;

