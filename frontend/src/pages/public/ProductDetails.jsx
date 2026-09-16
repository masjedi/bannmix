import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Home,
    ImageIcon,
    Phone,
    ShoppingBag,
    X,
    ZoomIn,
} from "lucide-react";

import heroImage from "../../assets/hero.png";
import { publicProductsApi } from "../../api/publicProductsApi";
import { useLanguage } from "../../context/LanguageContext";
import {
    Container,
    PublicCard,
    PublicPage,
    SectionLabel,
} from "../../components/public/ui";
import publicTranslations, {
    ORDER_CONTACTS,
} from "../../i18n/publicTranslations";

const formatPrice = (product, priceOnRequest) => {
    if (
        product?.price === null ||
        product?.price === undefined ||
        product?.price === ""
    ) {
        return priceOnRequest;
    }

    const price = Number(product.price).toLocaleString();
    if (product.currency === "USD") return `$${price}`;
    if (product.currency === "AFN") return `${price} AFN`;
    return `${product.currency || ""} ${price}`.trim();
};

const whatsappOrder = (title, translate) => {
    const message = translate({
        en: `Hello BanMix, I want to order: ${title || "Majoon"}`,
        ps: `سلام BanMix، زه غواړم دا فرمایش ورکړم: ${title || "معجون"}`,
        fa: `سلام BanMix، می‌خواهم این را سفارش دهم: ${title || "معجون"}`,
    });

    return `https://wa.me/${ORDER_CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`;
};

const Gallery = ({ images, title, onOpenLightbox }) => {
    const [active, setActive] = useState(0);
    const current = images[active];

    useEffect(() => {
        if (active >= images.length) setActive(0);
    }, [images, active]);

    return (
        <div>
            <div className="home-hero-media group relative grid aspect-square place-items-center overflow-hidden p-3 sm:p-4">
                {current ? (
                    <>
                        <img
                            src={current}
                            alt={title}
                            className="h-full w-full rounded-[20px] object-contain transition duration-500 group-hover:scale-105"
                        />
                        <button
                            type="button"
                            onClick={() => onOpenLightbox(active)}
                            aria-label="Open image"
                            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-theme-surface/90 text-content shadow-sm backdrop-blur transition hover:text-brand-orange dark:bg-theme-page/80 text-content"
                        >
                            <ZoomIn size={15} />
                        </button>
                    </>
                ) : (
                    <div className="text-center text-content-secondary text-content/35">
                        <ImageIcon size={48} className="mx-auto" />
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, index) => (
                        <button
                            key={`${src}-${index}`}
                            type="button"
                            onClick={() => setActive(index)}
                            className={[
                                "h-18 w-18 relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-theme-surface dark:bg-theme-surface/6",
                                active === index
                                    ? "border-2 border-brand-orange"
                                    : "border-2 border-transparent",
                            ].join(" ")}
                        >
                            <img
                                src={src}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
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
            {images.length > 1 && (
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
            )}
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

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await publicProductsApi.getProduct(id);
                const data = response?.data?.data || response?.data || response;
                if (active) setProduct(data);
            } catch (err) {
                if (active) {
                    setError(
                        err?.response?.data?.message ||
                            "Product could not be loaded."
                    );
                    setProduct(null);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [id]);

    const images = useMemo(() => {
        if (!product) return [];
        const list = [
            product.main_image_url,
            ...(product.gallery_image_urls || []),
        ].filter(Boolean);
        return list.length ? list : [heroImage];
    }, [product]);

    const ingredients =
        product?.ingredients ||
        product?.certifications ||
        translate(t.defaultIngredients);
    const nutrition = product?.nutrition || translate(t.defaultNutrition);
    const usage =
        product?.usage_instructions ||
        product?.sample_available ||
        translate(t.defaultUsage);

    if (loading) {
        return (
            <PublicPage className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-content-secondary">
                {translate(t.loading)}
            </PublicPage>
        );
    }

    if (error || !product) {
        return (
            <PublicPage className="py-20 text-center">
                <p className="text-sm font-semibold text-red-600">
                    {error || "Product not found."}
                </p>
                <Link
                    to="/products"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-orange"
                >
                    <ArrowLeft size={14} />
                    {translate(publicTranslations.common.backToProducts)}
                </Link>
            </PublicPage>
        );
    }

    return (
        <PublicPage>
            <Container className="max-w-6xl py-8 sm:py-10">
                <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-content-secondary text-content-muted">
                        <li>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-1 hover:text-brand-orange"
                            >
                                <Home size={13} />
                                {translate(publicTranslations.navigation.home)}
                            </Link>
                        </li>
                        <li className="text-content-muted">/</li>
                        <li>
                            <Link
                                to="/products"
                                className="hover:text-brand-orange"
                            >
                                {translate(
                                    publicTranslations.navigation.products
                                )}
                            </Link>
                        </li>
                        <li className="text-content-muted">/</li>
                        <li className="max-w-[220px] truncate font-semibold text-content text-content">
                            {product.title}
                        </li>
                    </ol>
                </nav>

                <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
                    <div>
                        <SectionLabel>{translate(t.images)}</SectionLabel>
                        <div className="mt-4">
                            <Gallery
                                images={images}
                                title={product.title}
                                onOpenLightbox={setLightboxIndex}
                            />
                        </div>
                    </div>

                    <div>
                        {product.category && (
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-orange">
                                {product.category}
                            </p>
                        )}
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-content text-content sm:text-4xl">
                            {product.title}
                        </h1>
                        {product.brand && (
                            <p className="mt-2 text-sm font-semibold text-content-secondary text-content-muted">
                                {product.brand}
                            </p>
                        )}
                        {product.content && (
                            <p className="mt-5 text-base leading-7 text-content-secondary text-content-secondary">
                                {product.content}
                            </p>
                        )}

                        <div className="mt-8 rounded-2xl bg-theme-surface-soft px-1 py-6 sm:px-4">
                            <SectionLabel>{translate(t.pricing)}</SectionLabel>
                            <p className="mt-3 text-3xl font-extrabold text-brand-orange">
                                {formatPrice(
                                    product,
                                    translate(t.priceOnRequest)
                                )}
                            </p>
                            {(product.moq || product.unit) && (
                                <p className="mt-2 text-sm text-content-secondary text-content-muted">
                                    {[
                                        product.moq
                                            ? `MOQ: ${product.moq}`
                                            : null,
                                        product.unit,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            <SectionLabel>{translate(t.onlineOrdering)}</SectionLabel>
                            <p className="mt-3 text-sm leading-6 text-content-secondary text-content-secondary">
                                {translate(t.orderHelp)}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <a
                                    href={whatsappOrder(
                                        product.title,
                                        translate
                                    )}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand-orange px-6 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                                >
                                    <ShoppingBag size={16} />
                                    {translate(
                                        publicTranslations.common.orderNow
                                    )}
                                </a>
                                <a
                                    href={ORDER_CONTACTS.phoneHref}
                                    className="btn-secondary"
                                >
                                    <Phone size={16} />
                                    {translate(
                                        publicTranslations.common.callToOrder
                                    )}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    <PublicCard>
                        <SectionLabel>{translate(t.ingredients)}</SectionLabel>
                        <p className="mt-4 text-sm leading-7 text-content-secondary text-content-secondary">
                            {ingredients}
                        </p>
                    </PublicCard>
                    <PublicCard>
                        <SectionLabel>{translate(t.nutrition)}</SectionLabel>
                        <p className="mt-4 text-sm leading-7 text-content-secondary text-content-secondary">
                            {nutrition}
                        </p>
                    </PublicCard>
                    <PublicCard>
                        <SectionLabel>{translate(t.usage)}</SectionLabel>
                        <p className="mt-4 text-sm leading-7 text-content-secondary text-content-secondary">
                            {usage}
                        </p>
                    </PublicCard>
                </div>

                <div className="mt-10">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange"
                    >
                        <ArrowLeft size={14} />
                        {translate(publicTranslations.common.backToProducts)}
                    </Link>
                </div>
            </Container>

            {lightboxIndex !== null && (
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
            )}
        </PublicPage>
    );
};

export default ProductDetails;
