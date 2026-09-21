import { useState } from "react";

const BrandPlaceholder = () => (
    <div
        className="product-card-image-placeholder flex h-full w-full flex-col items-center justify-center"
        aria-hidden="true"
    >
        <span className="text-2xl font-extrabold leading-none text-brand-blue">
            B
        </span>
        <span className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-orange">
            BanMix
        </span>
    </div>
);

const ProductImage = ({
    src,
    alt = "",
    className = "",
    loading = "lazy",
    sizes,
    interactive = true,
    fit = "cover",
}) => {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src) && !failed;
    const isContain = fit === "contain";

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {showImage ? (
                <img
                    src={src}
                    alt={alt}
                    loading={loading}
                    decoding="async"
                    sizes={sizes}
                    className={[
                        "absolute inset-0 block h-full w-full max-w-none object-center",
                        isContain ? "object-contain p-4" : "object-cover",
                        interactive
                            ? "motion-safe:transition-transform motion-safe:duration-[220ms] motion-safe:ease-premium motion-safe:group-hover:scale-[1.02]"
                            : "",
                    ].join(" ")}
                    onError={() => setFailed(true)}
                />
            ) : (
                <BrandPlaceholder />
            )}
        </div>
    );
};

export default ProductImage;
