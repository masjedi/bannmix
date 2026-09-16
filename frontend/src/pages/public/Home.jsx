import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
    ArrowRight,
    Check,
    Factory,
    Leaf,
    MapPin,
    Package,
    Phone,
    Quote,
    ShoppingBag,
    Store,
    Truck,
} from "lucide-react";

import heroImage from "../../assets/hero.png";
import { publicProductsApi } from "../../api/publicProductsApi";
import {
    ButtonLink,
    Container,
    FadeUp,
    PageSection,
    PublicCard,
    PublicPage,
    SectionHeading,
    SectionLabel,
} from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import publicTranslations, {
    HOME_HIGHLIGHTS,
    HOME_NEWS,
    HOME_TESTIMONIALS,
    ORDER_CONTACTS,
} from "../../i18n/publicTranslations";

const highlightIcons = [Leaf, Package, Factory, Truck];
const trustIcons = [MapPin, Store, Package, Truck];

const whatsappHref = (message) =>
    `https://wa.me/${ORDER_CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`;

const orderMessage = (translate, title) =>
    translate({
        en: title
            ? `Hello BanMix, I want to order: ${title}`
            : "Hello BanMix, I would like to order Majoon for my shop.",
        ps: title
            ? `سلام BanMix، زه غواړم دا فرمایش ورکړم: ${title}`
            : "سلام BanMix، زه غواړم د خپل دوکان لپاره معجون فرمایش ورکړم.",
        fa: title
            ? `سلام BanMix، می‌خواهم این را سفارش دهم: ${title}`
            : "سلام BanMix، می‌خواهم برای فروشگاهم معجون سفارش دهم.",
    });

const Home = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.home;
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const response = await publicProductsApi.getProducts({
                    per_page: 3,
                    sort: "latest",
                });
                const list =
                    response?.data?.data ||
                    response?.data ||
                    (Array.isArray(response) ? response : []);
                if (active) setProducts(Array.isArray(list) ? list : []);
            } catch {
                if (active) setProducts([]);
            } finally {
                if (active) setProductsLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    const trustItems = [
        t.trustMadeInKabul,
        t.trustWholesale,
        t.trustRetail,
        t.trustDistribution,
    ];

    const introCapabilityIcons = [Factory, Package, Truck];

    const introCapabilities = useMemo(() => {
        const items = [
            {
                title: t.featureLocal,
                description: t.featureLocalBody,
            },
            {
                title: t.featurePackaging,
                description: t.featurePackagingBody,
            },
            {
                title: t.featureWholesale,
                description: t.featureWholesaleBody,
            },
        ];

        return items
            .map((item, index) => ({
                Icon: introCapabilityIcons[index % introCapabilityIcons.length],
                title: translate(item.title),
                description: item.description
                    ? translate(item.description)
                    : "",
            }))
            .filter((item) => item.title?.trim());
    }, [translate, t]);

    const introDescription = translate(t.introBody);
    const introImageSrc = heroImage;
    const capabilityGridClass =
        introCapabilities.length === 1
            ? "home-about-capabilities-grid is-single"
            : introCapabilities.length === 2
              ? "home-about-capabilities-grid is-duo"
              : introCapabilities.length > 3
                ? "home-about-capabilities-grid is-many"
                : "home-about-capabilities-grid";

    return (
        <PublicPage>
            {/* Hero */}
            <PageSection
                pad={false}
                border={false}
                className="home-hero relative overflow-hidden"
            >
                <div
                    className="pointer-events-none absolute -end-24 top-1/4 h-72 w-72 rounded-full bg-brand-green/5 blur-3xl"
                    aria-hidden="true"
                />

                <Container className="relative grid items-center gap-12 py-16 sm:gap-14 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-16 lg:py-20 xl:gap-20 xl:py-24">
                    <FadeUp
                        delay={100}
                        className="order-2 mx-auto w-full max-w-md lg:order-1 lg:max-w-none"
                    >
                        <div className="home-hero-media relative p-3 sm:p-4">
                            <img
                                src={heroImage}
                                alt="BanMix Majoon product"
                                width={640}
                                height={640}
                                className="aspect-square rounded-[22px]"
                                fetchPriority="high"
                            />

                            <div className="absolute start-5 top-5 rounded-full bg-theme-surface/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-green backdrop-blur-sm dark:bg-theme-surface-elevated/90">
                                {translate(t.trustMadeInKabul)}
                            </div>
                            <div className="absolute bottom-5 end-5 rounded-full bg-brand-orange px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                                {translate(t.badgeWholesale)}
                            </div>
                        </div>
                    </FadeUp>

                    <FadeUp className="order-1 lg:order-2">
                        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-orange">
                            {translate(t.heroEyebrow)}
                        </p>

                        <h1 className="mt-5 text-[clamp(2.125rem,5vw,4.25rem)] font-extrabold leading-[1.08] tracking-tight text-content">
                            {translate(t.heroTitleLead)}{" "}
                            <span className="text-brand-orange">
                                {translate(t.heroTitleAccent)}
                            </span>
                        </h1>

                        <p className="mt-6 max-w-[620px] text-base leading-[1.65] text-content-secondary sm:text-lg">
                            {translate(t.heroBody)}
                        </p>

                        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                            <ButtonLink
                                href={whatsappHref(orderMessage(translate))}
                                external
                                variant="primary"
                                className="h-[52px] w-full px-6 sm:w-auto"
                            >
                                <ShoppingBag size={16} />
                                {translate(t.orderWhatsApp)}
                            </ButtonLink>
                            <Link
                                to="/products"
                                className="home-hero-link w-full justify-center sm:w-auto sm:justify-start"
                            >
                                {translate(t.exploreProducts)}
                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-200 rtl:rotate-180"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>

                        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
                            {[
                                t.trustMadeInKabul,
                                t.trustWholesale,
                                t.trustDistribution,
                            ].map((item) => (
                                <li
                                    key={translate(item)}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-content-muted"
                                >
                                    <Check
                                        size={15}
                                        strokeWidth={2.5}
                                        className="shrink-0 text-brand-green dark:text-theme-brand-green"
                                        aria-hidden="true"
                                    />
                                    {translate(item)}
                                </li>
                            ))}
                        </ul>
                    </FadeUp>
                </Container>
            </PageSection>

            {/* Trust strip */}
            <section className="home-trust-strip" aria-label="Trust highlights">
                <Container className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-6 lg:py-9">
                    {trustItems.map((item, index) => {
                        const Icon = trustIcons[index];
                        return (
                            <FadeUp
                                key={translate(item)}
                                delay={index * 60}
                                className="home-trust-item"
                            >
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-green/10 text-brand-green dark:bg-brand-green/15 dark:text-theme-brand-green">
                                    <Icon size={20} strokeWidth={1.75} />
                                </span>
                                <p className="text-sm font-bold leading-snug text-content sm:text-[15px]">
                                    {translate(item)}
                                </p>
                            </FadeUp>
                        );
                    })}
                </Container>
            </section>

            {/* About / introduction */}
            <PageSection border={false} className="home-about">
                <Container>
                    <div className="home-about-header">
                        <FadeUp className="home-about-header-main">
                            <p className="home-about-label">
                                {translate(t.introLabel)}
                            </p>
                            <h2 className="home-about-title">
                                {translate(t.introTitle)}
                            </h2>
                        </FadeUp>

                        {(introDescription?.trim() ||
                            translate(t.discoverStory)?.trim()) && (
                            <FadeUp delay={80} className="home-about-header-aside">
                                {introDescription?.trim() ? (
                                    <p className="home-about-description">
                                        {introDescription}
                                    </p>
                                ) : null}
                                <Link
                                    to="/about"
                                    className="home-about-link"
                                >
                                    {translate(t.discoverStory)}
                                    <ArrowRight
                                        size={15}
                                        className="home-about-link-arrow rtl:rotate-180"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </FadeUp>
                        )}
                    </div>

                    {introImageSrc ? (
                        <div className="home-about-media">
                            <div className="home-about-media-frame">
                                <img
                                    src={introImageSrc}
                                    alt={translate(t.introTitle)}
                                    loading="lazy"
                                    width={1280}
                                    height={560}
                                    className="home-about-media-image"
                                />
                                <div className="home-about-media-badge">
                                    {translate(t.trustMadeInKabul)}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {introCapabilities.length > 0 && (
                        <ul className={capabilityGridClass}>
                            {introCapabilities.map((item, index) => {
                                const { Icon } = item;

                                return (
                                    <FadeUp
                                        key={item.title}
                                        as="li"
                                        delay={120 + index * 70}
                                        className="home-about-capability"
                                    >
                                        <span className="home-about-capability-icon">
                                            <Icon
                                                size={19}
                                                strokeWidth={1.75}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <h3 className="home-about-capability-title">
                                            {item.title}
                                        </h3>
                                        {item.description?.trim() ? (
                                            <p className="home-about-capability-body">
                                                {item.description}
                                            </p>
                                        ) : null}
                                    </FadeUp>
                                );
                            })}
                        </ul>
                    )}
                </Container>
            </PageSection>

            {/* Featured products */}
            <PageSection border={false} className="home-section-soft">
                <Container>
                    <FadeUp>
                        <SectionHeading
                            label={translate(t.productsLabel)}
                            title={translate(t.productsTitle)}
                            description={translate(t.productsSub)}
                        />
                    </FadeUp>

                    {productsLoading ? (
                        <p className="mt-10 text-sm font-semibold text-content-secondary text-content-secondary">
                            …
                        </p>
                    ) : products.length === 0 ? (
                        <FadeUp className="mt-10">
                            <PublicCard className="text-center">
                                <Package
                                    size={36}
                                    className="mx-auto text-brand-orange/50"
                                />
                                <p className="mt-3 text-sm font-semibold text-content-secondary text-content-secondary">
                                    {translate(t.productsEmpty)}
                                </p>
                                <ButtonLink
                                    to="/products"
                                    variant="secondary"
                                    className="mt-5"
                                >
                                    {translate(t.viewAllProducts)}
                                </ButtonLink>
                            </PublicCard>
                        </FadeUp>
                    ) : (
                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product, index) => {
                                const image =
                                    product.main_image_url ||
                                    product.gallery_image_urls?.[0] ||
                                    heroImage;

                                return (
                                    <FadeUp
                                        key={product.id}
                                        delay={index * 80}
                                        className="group flex flex-col"
                                    >
                                        <PublicCard
                                            hover
                                            padding={false}
                                            className="flex flex-1 flex-col overflow-hidden"
                                        >
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="relative aspect-[4/3] overflow-hidden bg-theme-surface dark:bg-theme-page"
                                        >
                                            <img
                                                src={image}
                                                alt={product.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition duration-500 ease-premium group-hover:scale-105"
                                            />
                                        </Link>

                                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                                            {product.unit || product.category ? (
                                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-orange">
                                                    {[
                                                        product.category,
                                                        product.unit,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            ) : null}

                                            <h3 className="mt-2 text-lg font-bold text-theme-page text-content sm:text-xl">
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="transition hover:text-brand-orange"
                                                >
                                                    {product.title}
                                                </Link>
                                            </h3>

                                            {product.content && (
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-content-secondary text-content-secondary">
                                                    {product.content}
                                                </p>
                                            )}

                                            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="btn-secondary h-10 px-3 text-xs"
                                                >
                                                    {translate(t.viewProduct)}
                                                </Link>
                                                <a
                                                    href={whatsappHref(
                                                        orderMessage(
                                                            translate,
                                                            product.title
                                                        )
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="btn-primary h-10 px-3 text-xs"
                                                >
                                                    {translate(
                                                        publicTranslations
                                                            .common.orderNow
                                                    )}
                                                </a>
                                            </div>
                                        </div>
                                        </PublicCard>
                                    </FadeUp>
                                );
                            })}
                        </div>
                    )}

                    {products.length > 0 && (
                        <FadeUp className="mt-8 text-center">
                            <ButtonLink to="/products" variant="secondary">
                                {translate(t.viewAllProducts)}
                                <ArrowRight size={15} />
                            </ButtonLink>
                        </FadeUp>
                    )}
                </Container>
            </PageSection>

            {/* Why shops choose BanMix */}
            <PageSection border={false} className="home-highlights">
                <Container>
                    <FadeUp>
                        <SectionHeading
                            label={translate(t.highlightsLabel)}
                            title={translate(t.highlightsTitle)}
                            className="home-highlights-heading"
                        />
                    </FadeUp>

                    <ul className="home-highlights-grid mt-12 lg:mt-14">
                        {HOME_HIGHLIGHTS.map((item, index) => {
                            const title = translate(item.title);
                            const body = translate(item.body);

                            if (!title?.trim() || !body?.trim()) {
                                return null;
                            }

                            const Icon =
                                highlightIcons[
                                    index % highlightIcons.length
                                ];

                            return (
                                <FadeUp
                                    key={index}
                                    as="li"
                                    delay={index * 70}
                                    className="home-highlight-item"
                                >
                                    <span className="home-highlight-icon">
                                        <Icon
                                            size={20}
                                            strokeWidth={1.75}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <h3 className="home-highlight-title">
                                        {title}
                                    </h3>
                                    <p className="home-highlight-body">
                                        {body}
                                    </p>
                                </FadeUp>
                            );
                        })}
                    </ul>
                </Container>
            </PageSection>

            {/* Testimonials */}
            <PageSection border={false}>
                <Container>
                    <FadeUp>
                        <SectionHeading
                            label={translate(t.testimonialsLabel)}
                            title={translate(t.testimonialsTitle)}
                        />
                    </FadeUp>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {HOME_TESTIMONIALS.map((item, index) => (
                            <FadeUp key={index} delay={index * 80}>
                                <PublicCard hover className="h-full">
                                    <Quote
                                        size={22}
                                        className="text-brand-orange/45"
                                    />
                                    <p className="mt-4 text-sm leading-7 text-content text-content/80">
                                        “{translate(item.quote)}”
                                    </p>
                                    <footer className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-content-secondary text-content-secondary">
                                        {translate(item.name)}
                                    </footer>
                                </PublicCard>
                            </FadeUp>
                        ))}
                    </div>
                </Container>
            </PageSection>

            {/* Latest news */}
            <PageSection border={false} className="home-section-soft">
                <Container>
                    <FadeUp>
                        <SectionHeading
                            label={translate(t.newsLabel)}
                            title={translate(t.newsTitle)}
                        />
                    </FadeUp>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {HOME_NEWS.map((item, index) => (
                            <FadeUp key={index} delay={index * 80}>
                                <PublicCard
                                    hover
                                    padding={false}
                                    className="group overflow-hidden"
                                >
                                <div
                                    className={[
                                        "aspect-[16/10]",
                                        index === 0
                                            ? "bg-gradient-to-br from-brand-orange/30 to-white dark:to-theme-page"
                                            : index === 1
                                              ? "bg-gradient-to-br from-brand-blue/25 to-white dark:to-theme-page"
                                              : "bg-gradient-to-br from-theme-page/15 to-white dark:to-theme-page",
                                    ].join(" ")}
                                >
                                    {index === 0 && (
                                        <img
                                            src={heroImage}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-cover opacity-50"
                                        />
                                    )}
                                </div>
                                <div className="p-5 sm:p-6">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-orange">
                                        {translate(item.date)}
                                    </p>
                                    <h3 className="mt-2 text-lg font-bold text-theme-page text-content">
                                        {translate(item.title)}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-content-secondary text-content-secondary">
                                        {translate(item.body)}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-orange transition group-hover:gap-3">
                                        {translate(t.readMore)}
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                                </PublicCard>
                            </FadeUp>
                        ))}
                    </div>
                </Container>
            </PageSection>

            {/* Wholesale CTA */}
            <PageSection className="!bg-theme-page text-white" border={false}>
                <Container>
                    <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                        <FadeUp>
                            <SectionLabel className="!text-brand-orange">
                                {translate(t.orderLabel)}
                            </SectionLabel>
                            <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-extrabold tracking-tight">
                                {translate(t.orderTitle)}
                            </h2>
                            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                                {translate(t.orderBody)}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <ButtonLink
                                    href={whatsappHref(orderMessage(translate))}
                                    external
                                    variant="primary"
                                >
                                    <ShoppingBag size={16} />
                                    {translate(t.orderWhatsApp)}
                                </ButtonLink>
                                <ButtonLink
                                    href={ORDER_CONTACTS.phoneHref}
                                    variant="darkSecondary"
                                >
                                    <Phone size={16} />
                                    {translate(t.callSales)}
                                </ButtonLink>
                            </div>

                            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/75">
                                {[t.ctaFast, t.ctaKabul, t.ctaWholesale].map(
                                    (item) => (
                                        <li
                                            key={translate(item)}
                                            className="inline-flex items-center gap-2"
                                        >
                                            <Check
                                                size={14}
                                                className="text-brand-green"
                                            />
                                            {translate(item)}
                                        </li>
                                    )
                                )}
                            </ul>
                        </FadeUp>

                        <FadeUp delay={100} className="hidden lg:block">
                            <div className="relative mx-auto max-w-sm">
                                <div className="absolute inset-4 rounded-card bg-brand-orange/20 blur-xl" />
                                <img
                                    src={heroImage}
                                    alt="BanMix Majoon for wholesale"
                                    loading="lazy"
                                    className="relative aspect-square w-full rounded-card object-cover shadow-card-hover"
                                />
                            </div>
                        </FadeUp>
                    </div>
                </Container>
            </PageSection>

        </PublicPage>
    );
};

export default Home;
