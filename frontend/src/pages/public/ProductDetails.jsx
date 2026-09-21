import { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Heart,
    ImageIcon,
    Minus,
    Plus,
    Share2,
    X,
    ZoomIn,
} from "lucide-react";

import heroImage from "../../assets/hero.png";
import { publicProductsApi } from "../../api/publicProductsApi";
import InnerPageHero from "../../components/public/InnerPageHero";
import ProductRating from "../../components/public/products/ProductRating";
import ProductReviewSection from "../../components/public/products/ProductReviewSection";
import {
    buildOrderHref,
    formatDetailPrice,
    getProductImages,
    getProductReviewCount,
} from "../../components/public/products/productUtils";
import { useLanguage } from "../../context/LanguageContext";
import { Container, PublicPage } from "../../components/public/ui";
import { RichText } from "../../components/TextEditor";
import publicTranslations, {
    ORDER_CONTACTS,
} from "../../i18n/publicTranslations";

const FAVORITES_KEY = "banmix-product-favorites";

const readFavoriteIds = () => {
    try {
        const raw = window.localStorage.getItem(FAVORITES_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
        return new Set();
    }
};

const writeFavoriteIds = (ids) => {
    try {
        window.localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(Array.from(ids))
        );
    } catch {
        // Ignore unavailable storage.
    }
};

const QuantityControl = ({ value, onChange, min = 1, max = 99, compact = false }) => {
    const decrease = () => onChange(Math.max(min, value - 1));
    const increase = () => onChange(Math.min(max, value + 1));

    const buttonClass = compact
        ? "grid h-9 w-9 place-items-center rounded-full border border-line text-content-secondary transition hover:border-brand-blue hover:text-brand-blue"
        : "grid h-10 w-10 place-items-center rounded-full border border-line text-content-secondary transition hover:border-brand-blue hover:text-brand-blue";

    const valueClass = compact
        ? "min-w-[2rem] text-center text-sm font-semibold text-content"
        : "min-w-[2.5rem] text-center text-base font-semibold text-content";

    return (
        <div className="inline-flex items-center gap-2">
            <button type="button" onClick={decrease} disabled={value <= min} className={buttonClass}>
                <Minus size={compact ? 14 : 16} />
            </button>
            <span className={valueClass}>{value}</span>
            <button type="button" onClick={increase} disabled={value >= max} className={buttonClass}>
                <Plus size={compact ? 14 : 16} />
            </button>
        </div>
    );
};

const ProductGallery = ({ images, title, onOpenLightbox }) => {
    const [active, setActive] = useState(0);
    const current = images[Math.min(active, images.length - 1)];

    useEffect(() => {
        if (active >= images.length) setActive(0);
    }, [images, active]);

    return (
        <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-theme-surface-soft">
                {current ? (
                    <>
                        <img
                            src={current}
                            alt={title}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => onOpenLightbox(active)}
                            aria-label="Zoom image"
                            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-line bg-theme-surface/95 text-content-secondary shadow-sm backdrop-blur transition hover:text-brand-orange"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </>
                ) : (
                    <div className="text-content-muted">
                        <ImageIcon size={56} className="mx-auto" />
                    </div>
                )}
            </div>

            {images.length > 1 ? (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {images.map((src, index) => (
                        <button
                            key={`${src}-${index}`}
                            type="button"
                            onClick={() => setActive(index)}
                            className={[
                                "h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-theme-surface transition",
                                active === index
                                    ? "border-content ring-1 ring-content/10"
                                    : "border-line hover:border-brand-blue/40",
                            ].join(" ")}
                        >
                            <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const onKey = (event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "ArrowLeft") onPrev();
            if (event.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose, onPrev, onNext]);

    if (!images[index]) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-theme-page/90 p-4 backdrop-blur">
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-theme-surface/10 text-white"
            >
                <X size={20} />
            </button>
            {images.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={onPrev}
                        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-theme-surface/10 text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-theme-surface/10 text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            ) : null}
            <img
                src={images[index]}
                alt=""
                className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain"
            />
        </div>
    );
};

const ProductDetails = () => {
    const { id } = useParams();
    const { translate } = useLanguage();
    const t = publicTranslations.products;
    const nav = publicTranslations.navigation;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [favorite, setFavorite] = useState(false);
    const [shareNote, setShareNote] = useState("");

    const loadProduct = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await publicProductsApi.getProduct(id);
            const data = response?.data?.data || response?.data || response;
            setProduct(data);
        } catch (err) {
            setError(
                err?.response?.data?.message || "Product could not be loaded."
            );
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProduct();
    }, [loadProduct]);

    useEffect(() => {
        setQuantity(1);
        if (product?.id) {
            setFavorite(readFavoriteIds().has(product.id));
        }
    }, [product?.id]);

    const images = useMemo(() => {
        const list = getProductImages(product);
        return list.length ? list : [heroImage];
    }, [product]);

    const orderOptions = useMemo(() => ({ quantity }), [quantity]);

    const orderHref = useMemo(
        () => (product ? buildOrderHref(product, translate, orderOptions) : "#"),
        [orderOptions, product, translate]
    );

    const priceInfo = useMemo(
        () => formatDetailPrice(product, translate(t.priceOnRequest)),
        [product, t.priceOnRequest, translate]
    );

    const subtotalDisplay = useMemo(() => {
        if (priceInfo.numeric === null) return priceInfo.display;
        const total = priceInfo.numeric * quantity;
        const formatted = total.toLocaleString(undefined, {
            minimumFractionDigits: Number.isInteger(total) ? 0 : 2,
            maximumFractionDigits: 2,
        });
        const currency = String(product?.currency || "USD").trim().toUpperCase();
        if (currency === "USD") return `$${formatted}`;
        if (currency === "AFN") return `${formatted} AFN`;
        return `${currency} ${formatted}`;
    }, [priceInfo, product?.currency, quantity]);

    const description = product?.content?.trim() || "";

    const keyFeatures = useMemo(() => {
        const fromCertifications = String(product?.certifications || "")
            .split(/[\n,·•]/)
            .map((item) => item.trim())
            .filter(Boolean);

        if (fromCertifications.length > 0) return fromCertifications;

        return [
            translate(t.defaultIngredients),
            translate(t.defaultNutrition),
            translate(t.madeInKabul),
        ];
    }, [product?.certifications, t.defaultIngredients, t.defaultNutrition, t.madeInKabul, translate]);

    const usageDirections =
        (typeof product?.usage_instructions === "string" &&
            product.usage_instructions.trim()) ||
        translate(t.defaultUsage);

    const toggleFavorite = useCallback(() => {
        if (!product?.id) return;
        const ids = readFavoriteIds();
        if (ids.has(product.id)) {
            ids.delete(product.id);
            setFavorite(false);
        } else {
            ids.add(product.id);
            setFavorite(true);
        }
        writeFavoriteIds(ids);
    }, [product?.id]);

    const handleShare = useCallback(async () => {
        const url = window.location.href;
        const title = product?.title || translate(publicTranslations.brand.product);

        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }

            await navigator.clipboard.writeText(url);
            setShareNote(translate(t.linkCopied));
            window.setTimeout(() => setShareNote(""), 2400);
        } catch {
            // User cancelled share or clipboard unavailable.
        }
    }, [product?.title, t.linkCopied, translate]);

    const priceAlertHref = useMemo(() => {
        const message = translate({
            en: `Hello BanMix, please notify me about price updates for: ${product?.title || "Majoon"}`,
            ps: `سلام BanMix، مهرباني وکړئ د قیمت تازه معلوماتو لپاره خبر راکړئ: ${product?.title || "معجون"}`,
            fa: `سلام BanMix، لطفاً درباره به‌روزرسانی قیمت اطلاع دهید: ${product?.title || "معجون"}`,
        });

        return `https://wa.me/${ORDER_CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`;
    }, [product?.title, translate]);

    if (loading) {
        return (
            <PublicPage className="flex min-h-[calc(100vh-6rem)] items-center justify-center text-sm font-semibold text-content-secondary">
                {translate(t.loading)}
            </PublicPage>
        );
    }

    if (error || !product) {
        return (
            <PublicPage>
                <InnerPageHero
                    alignment="start"
                    eyebrow={translate(t.heroLabel)}
                    title={translate(t.notFoundTitle)}
                    description={error || translate(t.notFoundBody)}
                    primaryAction={{
                        label: translate(publicTranslations.common.backToProducts),
                        to: "/products",
                    }}
                />
            </PublicPage>
        );
    }

    const categoryLabel = product.category || translate(publicTranslations.brand.product);
    const metaParts = [
        categoryLabel,
        product.unit ? String(product.unit).trim() : null,
        translate(t.madeInKabul),
    ].filter(Boolean);

    return (
        <PublicPage className="product-details-page bg-theme-page pb-28 lg:pb-32">
            <Container className="max-w-6xl">
                <div className="flex flex-wrap items-center justify-between gap-4 py-5 sm:py-6">
                    <nav
                        aria-label="Breadcrumb"
                        className="text-sm text-content-muted"
                    >
                        <ol className="flex flex-wrap items-center gap-1.5">
                            <li>
                                <Link to="/" className="transition hover:text-brand-blue">
                                    {translate(nav.home)}
                                </Link>
                            </li>
                            <li aria-hidden="true">›</li>
                            <li>
                                <Link
                                    to="/products"
                                    className="transition hover:text-brand-blue"
                                >
                                    {translate(nav.products)}
                                </Link>
                            </li>
                            <li aria-hidden="true">›</li>
                            <li className="font-medium text-content-secondary">
                                {product.title}
                            </li>
                        </ol>
                    </nav>

                    <div className="flex items-center gap-2">
                        <div className="group relative">
                            <a
                                href={priceAlertHref}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-theme-surface text-content-secondary transition hover:border-brand-blue hover:text-brand-blue"
                                aria-label={translate(t.priceDropAlert)}
                            >
                                <Bell size={18} />
                            </a>
                            <span className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-content px-2.5 py-1 text-xs font-medium text-theme-surface group-hover:block">
                                {translate(t.priceDropAlert)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleShare}
                            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-theme-surface text-content-secondary transition hover:border-brand-blue hover:text-brand-blue"
                            aria-label={translate(t.shareProduct)}
                        >
                            <Share2 size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={toggleFavorite}
                            className={[
                                "grid h-10 w-10 place-items-center rounded-full border bg-theme-surface transition",
                                favorite
                                    ? "border-brand-orange text-brand-orange"
                                    : "border-line text-content-secondary hover:border-brand-orange hover:text-brand-orange",
                            ].join(" ")}
                            aria-label={
                                favorite
                                    ? translate(t.removeFavorite)
                                    : translate(t.addFavorite)
                            }
                        >
                            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>

                {shareNote ? (
                    <p className="mb-4 text-sm font-medium text-brand-green" role="status">
                        {shareNote}
                    </p>
                ) : null}

                <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
                    <ProductGallery
                        images={images}
                        title={product.title}
                        onOpenLightbox={setLightboxIndex}
                    />

                    <div className="min-w-0">
                        <h1 className="type-product-title text-content">
                            {product.title}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content-muted">
                            {metaParts.map((part, index) => (
                                <span key={`${part}-${index}`} className="inline-flex items-center gap-2">
                                    {index > 0 ? <span aria-hidden="true">·</span> : null}
                                    {part}
                                </span>
                            ))}
                            {getProductReviewCount(product) > 0 ? (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <ProductRating product={product} size={14} />
                                </>
                            ) : null}
                        </div>

                        <div className="mt-6">
                            <p className="type-product-price text-content">
                                {priceInfo.display}
                            </p>
                            <p className="mt-2 text-sm text-content-muted">
                                {priceInfo.numeric !== null
                                    ? translate({
                                          en: `(or contact us for wholesale pricing and ${product.moq ? `MOQ ${product.moq}` : "bulk orders"})`,
                                          ps: `(یا د عمده قیمت او ${product.moq ? `لږترلږه ${product.moq}` : "لوی فرمایش"} لپاره موږ سره اړیکه ونیسئ)`,
                                          fa: `(یا برای قیمت عمده و ${product.moq ? `حداقل ${product.moq}` : "سفارش عمده"} با ما تماس بگیرید)`,
                                      })
                                    : translate(t.priceOnRequestNote)}
                            </p>
                        </div>

                        <div className="mt-8">
                            <p className="text-sm font-semibold text-content">
                                {translate(t.quantity)}
                            </p>
                            <div className="mt-3">
                                <QuantityControl
                                    value={quantity}
                                    onChange={setQuantity}
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="mt-10 space-y-8 border-t border-line pt-8">
                            {description ? (
                                <section>
                                    <h2 className="type-product-section-title text-content">
                                        {translate(t.productDescription)}
                                    </h2>
                                    <RichText
                                        html={description}
                                        className="mt-3 text-sm leading-7 text-content-secondary"
                                    />
                                </section>
                            ) : null}

                            <section>
                                <h2 className="type-product-section-title text-content">
                                    {translate(t.keyFeatures)}
                                </h2>
                                <ul className="mt-3 space-y-2 text-sm leading-7 text-content-secondary">
                                    {keyFeatures.map((feature) => (
                                        <li key={feature} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="type-product-section-title text-content">
                                    {translate(t.usageDirections)}
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-content-secondary">
                                    {usageDirections}
                                </p>
                            </section>

                            <section>
                                <h2 className="type-product-section-title text-content">
                                    {translate(t.availability)}
                                </h2>
                                <p className="mt-3 text-sm font-medium text-brand-green">
                                    {translate(t.inStock)}
                                </p>
                            </section>
                        </div>
                    </div>
                </div>

                <ProductReviewSection product={product} onReviewSubmitted={loadProduct} />
            </Container>

            <div className="product-details-sticky-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-theme-surface/95 backdrop-blur">
                <Container className="max-w-6xl">
                    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-5">
                            <QuantityControl
                                value={quantity}
                                onChange={setQuantity}
                                min={1}
                                compact
                            />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
                                    {translate(t.subtotal)}
                                </p>
                                <p className="text-xl font-bold text-content">
                                    {subtotalDisplay}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <a
                                href={orderHref}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-theme-surface px-8 text-sm font-semibold text-content transition hover:border-brand-blue hover:text-brand-blue"
                            >
                                {translate(t.addToCart)}
                            </a>
                            <a
                                href={orderHref}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-bold text-white shadow-sm shadow-brand-orange/25 transition hover:bg-brand-orange/90"
                            >
                                {translate(t.buyNow)}
                            </a>
                        </div>
                    </div>
                </Container>
            </div>

            {lightboxIndex !== null ? (
                <Lightbox
                    images={images}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() =>
                        setLightboxIndex((current) =>
                            current === 0 ? images.length - 1 : current - 1
                        )
                    }
                    onNext={() =>
                        setLightboxIndex((current) =>
                            current === images.length - 1 ? 0 : current + 1
                        )
                    }
                />
            ) : null}
        </PublicPage>
    );
};

export default ProductDetails;
