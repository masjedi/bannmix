import { Link } from "react-router-dom";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import BrandLogo from "../BrandLogo";
import { SocialProfileLinks } from "./contact/ContactSocialStrip";
import { PUBLIC_NAV_ITEMS } from "./publicNavigation";
import { Container, LtrIsolate } from "./ui";
import { useLanguage } from "../../context/LanguageContext";
import publicTranslations, {
    ORDER_CONTACTS,
} from "../../i18n/publicTranslations";

const FooterLink = ({ to, children }) => (
    <li>
        <Link
            to={to}
            className="text-sm text-content-secondary transition hover:text-theme-link"
        >
            {children}
        </Link>
    </li>
);

const PublicFooter = () => {
    const { translate } = useLanguage();
    const f = publicTranslations.footer;

    const whatsappHref = `https://wa.me/${ORDER_CONTACTS.whatsapp}`;

    return (
        <footer className="public-site-footer">
            <Container className="public-footer-wrap">
                <div className="public-footer-panel">
                    <div
                        className="public-footer-main grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
                    >
                        <div>
                            <Link to="/" className="inline-flex items-center">
                                <BrandLogo className="w-[140px]" />
                            </Link>
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-content-secondary">
                                {translate(f.description)}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={translate(publicTranslations.contact.socialLabel)}>
                                <SocialProfileLinks compact />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-content">
                                {translate(f.companyTitle)}
                            </h2>
                            <ul className="mt-4 space-y-2.5">
                                {PUBLIC_NAV_ITEMS.slice(0, 3).map((item) => (
                                    <FooterLink key={item.to} to={item.to}>
                                        {translate(publicTranslations.navigation[item.labelKey])}
                                    </FooterLink>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-content">
                                {translate(f.exploreTitle)}
                            </h2>
                            <ul className="mt-4 space-y-2.5">
                                {PUBLIC_NAV_ITEMS.slice(3).map((item) => (
                                    <FooterLink key={item.to} to={item.to}>
                                        {translate(publicTranslations.navigation[item.labelKey])}
                                    </FooterLink>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-content">
                                {translate(f.contactTitle)}
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm text-content-secondary">
                                <li className="flex items-start gap-2.5">
                                    <MapPin
                                        size={15}
                                        className="mt-0.5 shrink-0 text-brand-orange"
                                    />
                                    Kabul, Afghanistan
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Phone
                                        size={15}
                                        className="shrink-0 text-brand-orange"
                                    />
                                    <a
                                        href={ORDER_CONTACTS.phoneHref}
                                        className="transition hover:text-theme-link"
                                    >
                                        <LtrIsolate>
                                            {ORDER_CONTACTS.phoneDisplay}
                                        </LtrIsolate>
                                    </a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Mail
                                        size={15}
                                        className="shrink-0 text-brand-orange"
                                    />
                                    <a
                                        href={`mailto:${ORDER_CONTACTS.email}`}
                                        className="transition hover:text-theme-link"
                                    >
                                        <LtrIsolate>
                                            {ORDER_CONTACTS.email}
                                        </LtrIsolate>
                                    </a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <MessageCircle
                                        size={15}
                                        className="shrink-0 text-brand-orange"
                                    />
                                    <a
                                        href={whatsappHref}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="transition hover:text-theme-link"
                                    >
                                        {translate(f.whatsapp)}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div
                        className="public-footer-line public-footer-line-static"
                        aria-hidden="true"
                    />

                    <div className="public-footer-bottom flex flex-col items-center justify-between gap-3 text-xs text-content-muted sm:flex-row">
                        <p>
                            © {new Date().getFullYear()} BannMix.{" "}
                            {translate(f.rightsReserved)}
                        </p>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default PublicFooter;
