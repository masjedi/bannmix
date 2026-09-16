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



const ProductCard = ({ product, translate, copy, eager = false }) => {

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



    return (

        <article className="product-card group mx-auto w-full max-w-[320px] overflow-hidden transition duration-[220ms] ease-premium motion-reduce:transition-none">

            <div className="p-4">

                <Link

                    to={detailsHref}

                    className="block w-full focus-visible:outline-theme-focus-ring"

                    aria-label={product.title || copy.viewDetails}

                >

                    <ProductImage

                        src={activeImage}

                        alt={product.title || ""}

                        loading={eager ? "eager" : "lazy"}

                        sizes="(min-width: 1280px) 300px, (min-width: 768px) 45vw, 90vw"

                        className="product-card-image-well aspect-[5/4] w-full rounded-[14px]"

                    />

                </Link>



                {visibleThumbs.length > 0 && (

                    <div

                        className="mt-2.5 flex items-center gap-1.5 overflow-x-auto"

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

                                    "product-card-thumb h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-theme-surface-soft focus-visible:outline-theme-focus-ring",

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

                        {extraImages > 0 && (

                            <span

                                className="shrink-0 pl-0.5 text-sm font-medium text-brand-orange"

                                aria-hidden="true"

                            >

                                + {extraImages}

                            </span>

                        )}

                    </div>

                )}



                <div className="mt-3">

                    {hasValue(product.category) && (

                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-brand-orange">

                            {product.category}

                        </p>

                    )}



                    {hasValue(product.title) && (

                        <h2

                            className={[

                                "text-[15px] font-semibold leading-snug text-content",

                                hasValue(product.category) ? "mt-1.5" : "",

                            ].join(" ")}

                        >

                            <Link

                                to={detailsHref}

                                className="line-clamp-1 transition hover:text-brand-orange focus-visible:outline-theme-focus-ring"

                            >

                                {product.title}

                            </Link>

                        </h2>

                    )}



                    <p

                        className={[

                            "text-[15px] font-bold text-content",

                            hasValue(product.title) ||

                            hasValue(product.category)

                                ? "mt-1"

                                : "",

                        ].join(" ")}

                    >

                        {priceLabel}

                    </p>

                </div>



                <div className="mt-3.5 flex items-center gap-2">

                    <a

                        href={orderHref}

                        target="_blank"

                        rel="noreferrer noopener"

                        className="product-card-order-btn inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-[10px] px-3 text-[11px] font-semibold uppercase tracking-[0.08em] transition duration-[220ms] focus-visible:outline-theme-focus-ring"

                    >

                        {copy.orderNow}

                    </a>

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

                            "grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-theme-surface-soft text-brand-orange transition duration-200 hover:bg-theme-surface-elevated focus-visible:outline-theme-focus-ring",

                            favorite ? "motion-safe:scale-105" : "",

                        ].join(" ")}

                    >

                        <Heart

                            size={18}

                            strokeWidth={2}

                            className={favorite ? "fill-brand-orange" : ""}

                            aria-hidden="true"

                        />

                    </button>

                </div>

            </div>

        </article>

    );

};



export default ProductCard;

