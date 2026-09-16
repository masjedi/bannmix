import { useState } from "react";

const BrandPlaceholder = () => (
    <div
        className="flex h-full w-full flex-col items-center justify-center"
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
}) => {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src) && !failed;

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
                        "block h-full w-full max-w-none object-contain object-center p-3 sm:p-4",
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
