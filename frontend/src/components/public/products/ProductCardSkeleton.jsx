const ProductCardSkeleton = ({ compact = false }) => (
    <div
        className={[
            "product-card flex h-full w-full flex-col overflow-hidden",
            compact ? "product-card-compact" : "",
        ].join(" ")}
        aria-hidden="true"
    >
        <div className={compact ? "flex h-full flex-col p-5" : "flex h-full flex-col px-[18px] py-5"}>
            <div className="product-card-image-well aspect-square w-full rounded-[14px] theme-skeleton" />
            {compact ? null : (
                <div className="mt-2 flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-8 w-8 shrink-0 rounded-lg theme-skeleton"
                        />
                    ))}
                </div>
            )}
            <div className="mt-3 flex flex-1 flex-col">
                <div className="h-[1.125rem] w-24 rounded theme-skeleton" />
                <div className="mt-1 h-[2.7rem] w-full rounded theme-skeleton" />
                <div className="mt-2 h-[2.52rem] w-full rounded theme-skeleton" />
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                <div className="h-4 w-20 rounded theme-skeleton" />
                <div
                    className={[
                        "rounded-full theme-skeleton",
                        compact ? "h-10 w-28" : "h-[42px] w-[132px]",
                    ].join(" ")}
                />
            </div>
        </div>
    </div>
);

export default ProductCardSkeleton;
