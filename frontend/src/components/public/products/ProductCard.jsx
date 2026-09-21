import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { Heart } from "lucide-react";

import ProductImage from "./ProductImage";
import {
    formatPrice,
    getProductImages,
    hasValue,
    whatsappOrder,
} from "./productUtils";
import { htmlToPlainText } from "../../../utils/htmlText";

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

const ProductCard = ({
    product,
    translate,
    copy,
    eager = false,
    showDescription = false,
    showViewProduct = false,
    showFavorite = true,
    showThumbs = true,
    headingLevel = "h2",
    compact = false,
    className = "",
}) => {
    const TitleTag = headingLevel === "h3" ? "h3" : "h2";

    const images = useMemo(() => getProductImages(product), [product]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [favorite, setFavorite] = useState(() => {
        if (typeof product?.is_favorite === "boolean") {
            return product.is_favorite;
        }
        if (typeof window === "undefined") return false;
        return readFavoriteIds().has(product.id);
    });

    useEffect(() => {
        setActiveIndex(0);
    }, [product.id]);

    useEffect(() => {
        if (typeof product?.is_favorite === "boolean") {
            setFavorite(product.is_favorite);
        }
    }, [product?.is_favorite, product.id]);

    const activeImage = images[Math.min(activeIndex, images.length - 1)] || "";
    const priceLabel = formatPrice(product, copy.priceOnRequest);
    const detailsHref = `/products/${product.id}`;
    const orderHref = whatsappOrder(product.title, translate);
    const visibleThumbs = images.slice(0, 5);
    const extraImages = Math.max(0, images.length - visibleThumbs.length);

    const toggleFavorite = () => {
        setFavorite((current) => {
            const next = !current;
            const ids = readFavoriteIds();
            if (next) ids.add(product.id);
            else ids.delete(product.id);
            writeFavoriteIds(ids);
            return next;
        });
    };

    const favoriteButton = showFavorite ? (
        <button
            type="button"
            onClick={toggleFavorite}
            aria-label={
                favorite
                    ? copy.removeFavorite || "Remove from favorites"
                    : copy.addFavorite || "Add to favorites"
            }
            aria-pressed={favorite}
            className={[
                "product-card-favorite",
                favorite ? "is-active" : "",
            ].join(" ")}
        >
            <Heart
                size={16}
                strokeWidth={2}
                className={favorite ? "fill-brand-orange" : ""}
                aria-hidden="true"
            />
        </button>
    ) : null;

    const imageSizes = compact
        ? "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
        : "(min-width: 1280px) 280px, (min-width: 768px) 33vw, 90vw";

    const imageAspect = "aspect-square";
    const imageFit = "cover";

    const thumbStrip =
        showThumbs && visibleThumbs.length > 0 ? (
            <div
                className="mt-2 flex items-center gap-1.5 overflow-x-auto"
                role="group"
                aria-label={copy.imagesLabel || copy.viewDetails}
            >
                {visibleThumbs.map((src, index) => (
                    <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={`${copy.viewDetails} ${index + 1}`}
                        aria-pressed={index === activeIndex}
                        className={[
                            "product-card-thumb h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-theme-surface-soft focus-visible:outline-theme-focus-ring",
                            index === activeIndex
                                ? "ring-2 ring-brand-orange ring-offset-1 ring-offset-theme-surface"
                                : "",
                        ].join(" ")}
                    >
                        <img
                            src={src}
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                        />
                    </button>
                ))}
                {extraImages > 0 ? (
                    <span
                        className="shrink-0 pl-0.5 text-xs font-medium text-brand-orange"
                        aria-hidden="true"
                    >
                        + {extraImages}
                    </span>
                ) : null}
            </div>
        ) : null;

    const categoryBlock = (
        <p
            className="product-card-category"
            aria-hidden={!hasValue(product.category)}
        >
            {hasValue(product.category) ? product.category : "\u00A0"}
        </p>
    );

    const titleBlock = (
        <TitleTag className="product-card-title mt-1">
            <Link to={detailsHref} className="product-card-title-link">
                {hasValue(product.title) ? product.title : "\u00A0"}
            </Link>
        </TitleTag>
    );

    const descriptionBlock = showDescription ? (
        <p className="product-card-description">
            {hasValue(product.content)
                ? htmlToPlainText(product.content)
                : "\u00A0"}
        </p>
    ) : null;

    const orderButton = (
        <a
            href={orderHref}
            target="_blank"
            rel="noreferrer noopener"
            className={[
                "product-card-order-btn",
                compact ? "product-card-order-btn-compact" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {copy.orderNow}
        </a>
    );

    if (compact) {
        return (
            <article
                className={[
                    "product-card product-card-compact group flex h-full w-full flex-col overflow-hidden transition duration-[220ms] ease-premium motion-reduce:transition-none",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className="flex h-full flex-col p-5">
                    <div className="product-card-media relative">
                        <Link
                            to={detailsHref}
                            className="product-card-image-link block w-full overflow-hidden rounded-[14px] focus-visible:outline-theme-focus-ring"
                            aria-label={product.title || copy.viewDetails}
                        >
                            <ProductImage
                                src={activeImage}
                                alt={product.title || ""}
                                loading={eager ? "eager" : "lazy"}
                                sizes={imageSizes}
                                fit={imageFit}
                                className={`product-card-image-well w-full rounded-[14px] ${imageAspect}`}
                            />
                        </Link>
                        {favoriteButton}
                    </div>

                    {thumbStrip}

                    <div className="mt-2.5 flex flex-1 flex-col">
                        {categoryBlock}
                        {titleBlock}
                        {descriptionBlock}
                        <p className="product-card-price mt-1.5">{priceLabel}</p>
                    </div>

                    <div className="mt-auto flex items-center gap-2 pt-3">
                        {showViewProduct ? (
                            <Link
                                to={detailsHref}
                                className="product-card-view-btn"
                            >
                                {copy.viewProduct || copy.viewDetails}
                            </Link>
                        ) : null}
                        {orderButton}
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article
            className={[
                "product-card group flex h-full w-full flex-col overflow-hidden transition duration-[220ms] ease-premium motion-reduce:transition-none",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="flex h-full flex-col px-[18px] py-5">
                <div className="product-card-media relative">
                    <Link
                        to={detailsHref}
                        className="product-card-image-link block w-full overflow-hidden rounded-[14px] focus-visible:outline-theme-focus-ring"
                        aria-label={product.title || copy.viewDetails}
                    >
                        <ProductImage
                            src={activeImage}
                            alt={product.title || ""}
                            loading={eager ? "eager" : "lazy"}
                            sizes={imageSizes}
                            fit={imageFit}
                            className={`product-card-image-well w-full rounded-[14px] ${imageAspect}`}
                        />
                    </Link>
                    {favoriteButton}
                </div>

                {thumbStrip}

                <div className="mt-3 flex flex-1 flex-col">
                    {categoryBlock}
                    {titleBlock}
                    {descriptionBlock}
                </div>

                <div className="product-card-footer mt-auto flex items-center justify-between gap-3 pt-3">
                    <p className="product-card-price min-w-0">{priceLabel}</p>
                    <div className="flex shrink-0 items-center gap-2">
                        {showViewProduct ? (
                            <Link
                                to={detailsHref}
                                className="product-card-view-btn product-card-view-btn-inline"
                            >
                                {copy.viewProduct || copy.viewDetails}
                            </Link>
                        ) : null}
                        {orderButton}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
