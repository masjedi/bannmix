import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
    ArrowRight,
    Check,
    Factory,
    Leaf,
    MapPin,
    Newspaper,
    Package,
    ShoppingBag,
    Store,
    Truck,
} from "lucide-react";

import { feedbackApi } from "../../api/feedbackApi";
import { publicProductsApi } from "../../api/publicProductsApi";
import HomeHeroCarousel from "../../components/public/HomeHeroCarousel";
import HomeAudienceSection from "../../components/public/home/HomeAudienceSection";
import HomeDistributionSection from "../../components/public/home/HomeDistributionSection";
import HomeFaqSection from "../../components/public/home/HomeFaqSection";
import HomeFeaturedProducts from "../../components/public/home/HomeFeaturedProducts";
import HomeIntroVideoSection from "../../components/public/home/HomeIntroVideoSection";
import HomeMajoonSection from "../../components/public/home/HomeMajoonSection";
import HomeMediaFallback from "../../components/public/home/HomeMediaFallback";
import HomeOrderingSection from "../../components/public/home/HomeOrderingSection";
import HomeQualitySection from "../../components/public/home/HomeQualitySection";
import HomeTestimonialsCarousel from "../../components/public/home/HomeTestimonialsCarousel";
import {
    buildHomeHeroSlides,
    collectProductImages,
} from "../../components/public/home/homeUtils";
import { extractYouTubeId } from "../../components/public/home/youtube";
import PostCard from "../../components/public/PostCard";
import {
    getEventDetailPath,
    normalizeEventItems,
} from "../../components/public/events/eventUtils";
import {
    hasProductImage,
    wholesaleWhatsApp,
} from "../../components/public/products/productUtils";
import {
    ButtonLink,
    Container,
    FadeUp,
    PageSection,
    PublicPage,
    SectionHeading,
} from "../../components/public/ui";
import { useLanguage } from "../../context/LanguageContext";
import usePublicPageContent from "../../hooks/usePublicPageContent";
import publicTranslations, {
    HOME_DISTRIBUTION_POINTS,
    HOME_MAJOON_ATTRIBUTES,
    HOME_QUALITY_POINTS,
} from "../../i18n/publicTranslations";

const highlightIcons = [Leaf, Package, Factory, Truck];
const trustIcons = [MapPin, Store, Package, Truck];
const introCapabilityIcons = [Factory, Package, Truck];

const Home = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.home;
    const { getFirstSectionItem, getSection, getIncludedSection } =
        usePublicPageContent("home");
    const introVideo = getFirstSectionItem("intro_video");
    const introVideoId = extractYouTubeId(introVideo?.video_url);
    const hero = getFirstSectionItem("hero");
    const majoonItems = getSection("majoon");
    const trustStripItems = getSection("trust_strip");
    const qualityIngredientItems = getSection("quality");
    const qualityPointItems = getSection("quality_points");
    const aboutIntro = getFirstSectionItem("about_intro");
    const aboutIntroPointItems = getSection("about_intro_points");
    const audienceItems = getSection("audience");
    const orderingItems = getSection("ordering");
    const highlightItems = getSection("highlights");
    const faqSectionItems = getSection("faq");
    const testimonialCmsItems = getSection("testimonials");
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [heroImages, setHeroImages] = useState([]);
    const [approvedFeedback, setApprovedFeedback] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        const loadProducts = async () => {
            try {
                const response = await publicProductsApi.getProducts(
                    {
                        per_page: 8,
                        sort: "latest",
                    },
                    { signal: controller.signal }
                );
                const list =
                    response?.data?.data ||
                    response?.data ||
                    (Array.isArray(response) ? response : []);
                const normalized = Array.isArray(list) ? list : [];

                if (!active) return;

                setProducts(normalized.filter(hasProductImage).slice(0, 3));
                setHeroImages(collectProductImages(normalized).slice(0, 8));
            } catch (error) {
                if (error?.code === "ERR_CANCELED") {
                    return;
                }

                if (active) {
                    setProducts([]);
                    setHeroImages([]);
                }
            } finally {
                if (active) setProductsLoading(false);
            }
        };

        const loadApprovedFeedback = async () => {
            try {
                const records = await feedbackApi.getApproved(
                    { per_page: 24 },
                    { signal: controller.signal }
                );

                if (!active) return;

                setApprovedFeedback(
                    records.filter(
                        (item) =>
                            item?.status !== "pending" &&
                            item?.status !== "rejected" &&
                            String(item?.message ?? "").trim() &&
                            String(item?.name ?? "").trim()
                    )
                );
            } catch (error) {
                if (error?.code === "ERR_CANCELED") {
                    return;
                }

                if (active) {
                    setApprovedFeedback([]);
                }
            }
        };

        Promise.all([loadProducts(), loadApprovedFeedback()]);

        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    const trustItems = useMemo(
        () =>
            trustStripItems.map((item, index) => ({
                label: item.title || "",
                Icon: trustIcons[index % trustIcons.length],
            })),
        [trustStripItems]
    );

    const introCapabilities = useMemo(() => {
        return aboutIntroPointItems.map((item, index) => ({
            Icon: introCapabilityIcons[index % introCapabilityIcons.length],
            title: item.title || "",
            description: item.content || "",
        }));
    }, [aboutIntroPointItems]);

    const introLabel = aboutIntro?.subtitle || "";
    const introTitle = aboutIntro?.title || "";
    const introDescription = aboutIntro?.content || "";
    const aboutImageSrc = useMemo(() => {
        const urls = Array.isArray(aboutIntro?.image_urls)
            ? aboutIntro.image_urls
            : [];
        if (urls.length > 0) return urls[0];
        return aboutIntro?.image_url || "";
    }, [aboutIntro]);
    const processWhatsAppHref = wholesaleWhatsApp(translate);
    const cmsHeroImages = useMemo(() => {
        const urls = Array.isArray(hero?.image_urls) ? hero.image_urls : [];
        if (urls.length > 0) return urls.filter(Boolean);
        return hero?.image_url ? [hero.image_url] : [];
    }, [hero]);

    const heroSlides = useMemo(
        () =>
            buildHomeHeroSlides({
                productImages: cmsHeroImages.length ? cmsHeroImages : heroImages,
                translate,
                copy: t,
            }),
        [cmsHeroImages, heroImages, translate, t]
    );

    const heroEyebrow = hero?.subtitle || translate(t.heroEyebrow);
    const heroTitle = hero?.title || "";
    const heroBody = hero?.content || translate(t.heroBody);
    const heroCtaLabel = hero?.button_text?.trim() || "";
    const heroCtaUrl = hero?.button_url?.trim() || "";
    const heroCtaIsExternal = /^https?:\/\//i.test(heroCtaUrl);

    const majoonAttributes = useMemo(() => {
        if (majoonItems.length > 0) {
            return majoonItems.map((item, index) => ({
                icon:
                    HOME_MAJOON_ATTRIBUTES[index % HOME_MAJOON_ATTRIBUTES.length]
                        ?.icon || "package",
                title: item.title || "",
                body: item.content || "",
            }));
        }

        return HOME_MAJOON_ATTRIBUTES.map((item) => ({
            icon: item.icon,
            title: translate(item.title),
            body: translate(item.body),
        }));
    }, [majoonItems, translate]);

    const qualityIngredients = useMemo(
        () =>
            qualityIngredientItems.map((item) => ({
                title: item.title || "",
                body: item.content || "",
            })),
        [qualityIngredientItems]
    );

    const qualityPoints = useMemo(
        () =>
            qualityPointItems.map((item, index) => ({
                icon:
                    HOME_QUALITY_POINTS[index % HOME_QUALITY_POINTS.length]
                        ?.icon || "package",
                title: item.title || "",
                body: item.content || "",
            })),
        [qualityPointItems]
    );

    const latestNews = useMemo(() => {
        const events = normalizeEventItems(
            getIncludedSection("events", "items")
        );
        return events.slice(-3).reverse();
    }, [getIncludedSection]);

    const audienceIcons = ["store", "bag", "truck", "users"];

    const audiences = useMemo(
        () =>
            audienceItems.map((item, index) => ({
                icon: audienceIcons[index % audienceIcons.length],
                title: item.title || "",
                body: item.content || "",
            })),
        [audienceItems]
    );

    const orderingSteps = useMemo(
        () =>
            orderingItems.map((item, index) => ({
                step: String(index + 1).padStart(2, "0"),
                title: item.title || "",
                body: item.content || "",
            })),
        [orderingItems]
    );

    const distributionPoints = HOME_DISTRIBUTION_POINTS.map((item) => ({
        icon: item.icon,
        title: translate(item.title),
        body: translate(item.body),
    }));

    const testimonialItems = useMemo(() => {
        const fromCms = testimonialCmsItems.map((item, index) => ({
            id: `cms-${item.id ?? index}`,
            quote: String(item.content ?? "").trim(),
            name: String(item.subtitle ?? "").trim(),
        }));

        const fromFeedback = approvedFeedback.map((item) => ({
            id: `feedback-${item.id}`,
            quote: String(item.message).trim(),
            name: String(item.name).trim(),
        }));

        return [...fromCms, ...fromFeedback].filter(
            (item) => item.quote && item.name
        );
    }, [testimonialCmsItems, approvedFeedback]);

    const faqItems = useMemo(
        () =>
            faqSectionItems.slice(0, 5).map((item, index) => ({
                id: `home-faq-${item.id ?? index}`,
                question: item.title || "",
                answer: item.content || "",
            })),
        [faqSectionItems]
    );

    return (
        <PublicPage>
            <PageSection
                pad={false}
                border={false}
                className="home-hero relative overflow-hidden"
            >
                <div
                    className="pointer-events-none absolute -end-24 top-1/4 h-72 w-72 rounded-full bg-brand-green/5 blur-3xl"
                    aria-hidden="true"
                />

                <Container className="home-hero-shell relative grid items-center gap-10 py-14 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-14 lg:py-20 xl:gap-16 xl:py-[4.75rem]">
                    <FadeUp className="home-hero-copy order-1 lg:order-2">
                        <p className="type-eyebrow text-brand-orange">
                            {heroEyebrow}
                        </p>

                        <h1 className="type-display-lg mt-5 text-content">
                            {heroTitle ? (
                                heroTitle
                            ) : (
                                <>
                                    {translate(t.heroTitleLead)}{" "}
                                    <span className="type-display-accent text-brand-orange">
                                        {translate(t.heroTitleAccent)}
                                    </span>
                                </>
                            )}
                        </h1>

                        <p className="type-lead mt-6 max-w-[620px] text-content-secondary">
                            {heroBody}
                        </p>

                        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                            {heroCtaLabel && heroCtaUrl ? (
                                <ButtonLink
                                    href={heroCtaIsExternal ? heroCtaUrl : undefined}
                                    to={heroCtaIsExternal ? undefined : heroCtaUrl}
                                    external={heroCtaIsExternal}
                                    variant="primary"
                                    className="h-[52px] w-full px-6 sm:w-auto"
                                >
                                    {heroCtaLabel}
                                </ButtonLink>
                            ) : (
                                <ButtonLink
                                    href={processWhatsAppHref}
                                    external
                                    variant="primary"
                                    className="h-[52px] w-full px-6 sm:w-auto"
                                >
                                    <ShoppingBag size={16} />
                                    {translate(t.orderWhatsApp)}
                                </ButtonLink>
                            )}
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

                        <ul className="home-hero-trust mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
                            {[
                                t.trustMadeInKabul,
                                t.trustWholesale,
                                t.trustRetail,
                            ].map((item) => (
                                <li
                                    key={translate(item)}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-content-muted"
                                >
                                    <Check
                                        size={15}
                                        strokeWidth={2.5}
                                        className="shrink-0 text-brand-green"
                                        aria-hidden="true"
                                    />
                                    {translate(item)}
                                </li>
                            ))}
                        </ul>
                    </FadeUp>

                    <FadeUp
                        delay={80}
                        className="home-hero-visual order-2 mx-auto w-full max-w-md lg:order-1 lg:max-w-none"
                    >
                        <HomeHeroCarousel
                            slides={heroSlides}
                            carouselLabel={translate(t.heroCarouselLabel)}
                            prevLabel={translate(t.heroCarouselPrev)}
                            nextLabel={translate(t.heroCarouselNext)}
                            goToTemplate={translate(t.heroCarouselGoTo)}
                        />
                    </FadeUp>
                </Container>
            </PageSection>

            {trustItems.length > 0 ? (
                <section className="home-trust-strip" aria-label="Trust highlights">
                    <Container className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-6 lg:py-9">
                        {trustItems.map((item, index) => {
                            const Icon = item.Icon;
                            return (
                                <FadeUp
                                    key={`${item.label}-${index}`}
                                    delay={index * 60}
                                    className="home-trust-item"
                                >
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-green/10 text-brand-green dark:bg-brand-green/15 dark:text-brand-green">
                                        <Icon size={20} strokeWidth={1.75} />
                                    </span>
                                    <p className="text-sm font-bold leading-snug text-content sm:text-[15px]">
                                        {item.label}
                                    </p>
                                </FadeUp>
                            );
                        })}
                    </Container>
                </section>
            ) : null}

            <HomeMajoonSection
                label={translate(t.majoonLabel)}
                title={translate(t.majoonTitle)}
                attributes={majoonAttributes}
            />

            {introVideoId ? (
                <HomeIntroVideoSection
                    label={translate(t.introVideoEyebrow)}
                    title={translate(t.introVideoTitle)}
                    description={translate(t.introVideoBody)}
                    youtubeUrl={introVideo.video_url}
                    thumbnailUrl={introVideo.image_url}
                    thumbnailAlt={translate(t.introVideoTitle)}
                    playLabel={translate(t.introVideoPlay)}
                    caption={translate(t.introVideoCaption)}
                />
            ) : null}

            <HomeFeaturedProducts
                label={translate(t.productsLabel)}
                title={translate(t.productsTitle)}
                description={translate(t.productsSub)}
                products={products}
                loading={productsLoading}
                emptyLabel={
                    productsLoading
                        ? translate(t.productsLoading)
                        : translate(t.productsEmpty)
                }
                viewAllLabel={translate(t.viewAllProducts)}
                viewProductLabel={translate(t.viewProduct)}
                orderNowLabel={translate(publicTranslations.common.orderNow)}
                priceOnRequest={translate(
                    publicTranslations.products.priceOnRequest
                )}
                viewDetailsLabel={translate(
                    publicTranslations.products.viewDetails
                )}
                imagesLabel={translate(publicTranslations.products.images)}
                addFavoriteLabel={translate(
                    publicTranslations.products.addFavorite
                )}
                removeFavoriteLabel={translate(
                    publicTranslations.products.removeFavorite
                )}
                translate={translate}
            />

            {qualityIngredients.length > 0 || qualityPoints.length > 0 ? (
                <HomeQualitySection
                    label={translate(t.qualityLabel)}
                    title={translate(t.qualityTitle)}
                    ingredients={qualityIngredients}
                    points={qualityPoints}
                />
            ) : null}

            {aboutIntro ? (
                <PageSection
                    border={false}
                    pad={false}
                    className="home-about home-section-compact"
                >
                    <Container>
                        <div className="home-about-editorial">
                            <div className="home-about-copy">
                                <FadeUp>
                                    <p className="home-about-label">
                                        {introLabel}
                                    </p>
                                    <h2 className="home-about-title">
                                        {introTitle}
                                    </h2>
                                </FadeUp>

                                {(introDescription?.trim() ||
                                    translate(t.discoverStory)?.trim()) && (
                                    <FadeUp
                                        delay={80}
                                        className="home-about-lead"
                                    >
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

                                {introCapabilities.length > 0 ? (
                                    <ul className="home-about-points">
                                        {introCapabilities.map(
                                            (item, index) => {
                                                const { Icon } = item;

                                                return (
                                                    <FadeUp
                                                        key={item.title}
                                                        as="li"
                                                        delay={
                                                            140 + index * 60
                                                        }
                                                        className="home-about-point"
                                                    >
                                                        <span className="home-about-point-icon">
                                                            <Icon
                                                                size={17}
                                                                strokeWidth={
                                                                    1.75
                                                                }
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                        <span className="home-about-point-title">
                                                            {item.title}
                                                        </span>
                                                    </FadeUp>
                                                );
                                            }
                                        )}
                                    </ul>
                                ) : null}
                            </div>

                            <FadeUp delay={160} className="home-about-visual">
                                <figure className="home-about-figure">
                                    <div className="home-about-media-frame">
                                        {aboutImageSrc ? (
                                            <img
                                                src={aboutImageSrc}
                                                alt={translate(
                                                    t.aboutImageAlt
                                                )}
                                                loading="lazy"
                                                width={420}
                                                height={315}
                                                className="home-about-media-image"
                                            />
                                        ) : (
                                            <div className="home-about-media-image">
                                                <HomeMediaFallback
                                                    label={translate(
                                                        t.mediaFallbackLabel
                                                    )}
                                                    hint={translate(
                                                        t.mediaFallbackHint
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <figcaption className="home-about-caption">
                                        {translate(t.trustMadeInKabul)}
                                    </figcaption>
                                </figure>
                            </FadeUp>
                        </div>
                    </Container>
                </PageSection>
            ) : null}

            {audiences.length > 0 ? (
                <HomeAudienceSection
                    label={translate(t.audienceLabel)}
                    title={translate(t.audienceTitle)}
                    description={translate(t.audienceBody)}
                    audiences={audiences}
                />
            ) : null}

            {orderingSteps.length > 0 ? (
                <HomeOrderingSection
                    label={translate(t.processLabel)}
                    title={translate(t.processTitle)}
                    description={translate(t.processBody)}
                    note={translate(t.processNote)}
                    steps={orderingSteps}
                    whatsappHref={processWhatsAppHref}
                    whatsappLabel={translate(t.orderWhatsApp)}
                />
            ) : null}

            {highlightItems.length > 0 ? (
                <PageSection
                    id="home-highlights"
                    border={false}
                    className="home-highlights home-section-compact scroll-mt-24"
                >
                    <Container>
                        <FadeUp>
                            <SectionHeading
                                label={translate(t.highlightsLabel)}
                                title={translate(t.highlightsTitle)}
                                className="home-highlights-heading"
                            />
                        </FadeUp>

                        <ul className="home-highlights-grid mt-8 lg:mt-10">
                            {highlightItems.map((item, index) => {
                                const title = item.title || "";
                                const body = item.content || "";

                                if (!title?.trim() || !body?.trim()) {
                                    return null;
                                }

                                const Icon =
                                    highlightIcons[index % highlightIcons.length];

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
            ) : null}

            <HomeDistributionSection
                label={translate(t.distributionLabel)}
                title={translate(t.distributionTitle)}
                description={translate(t.distributionBody)}
                points={distributionPoints}
            />

            {latestNews.length > 0 ? (
                <PageSection
                    id="home-news"
                    border={false}
                    className="home-section-soft home-news-section home-section-compact scroll-mt-24"
                >
                    <Container>
                        <FadeUp>
                            <SectionHeading
                                label={translate(t.newsLabel)}
                                title={translate(t.newsTitle)}
                            />
                        </FadeUp>

                        <div className="mt-8 grid gap-5 md:grid-cols-3">
                            {latestNews.map((item, index) => (
                                <FadeUp
                                    key={getEventDetailPath(item)}
                                    delay={index * 80}
                                >
                                    <PostCard
                                        imageUrl={item.image_url}
                                        title={item.title}
                                        subtitle={item.subtitle}
                                        excerpt={item.excerpt}
                                        to={getEventDetailPath(item)}
                                        viewLabel={translate(t.readMore)}
                                        fallbackIcon={item.icon || Newspaper}
                                        tone={item.tone}
                                    />
                                </FadeUp>
                            ))}
                        </div>
                    </Container>
                </PageSection>
            ) : null}

            {testimonialItems.length > 0 ? (
                <HomeTestimonialsCarousel
                    label={translate(t.testimonialsLabel)}
                    title={translate(t.testimonialsTitle)}
                    description={translate(t.testimonialsBody)}
                    cues={[
                        translate(t.trustMadeInKabul),
                        translate(t.trustRetail),
                        translate(t.trustWholesale),
                        translate(t.trustDistribution),
                    ]}
                    items={testimonialItems}
                />
            ) : null}

            {faqItems.length > 0 ? (
                <HomeFaqSection
                    label={translate(t.faqLabel)}
                    title={translate(t.faqTitle)}
                    description={translate(t.faqBody)}
                    helpLabel={translate(t.faqHelp)}
                    whatsappLabel={translate(t.faqWhatsApp)}
                    whatsappHref={processWhatsAppHref}
                    items={faqItems}
                />
            ) : null}
        </PublicPage>
    );
};

export default Home;
