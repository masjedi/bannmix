const ProductCardSkeleton = () => (
    <div
        className="product-card mx-auto w-full max-w-[320px] overflow-hidden"
        aria-hidden="true"
    >
        <div className="p-4">
            <div className="product-card-image-well aspect-[5/4] w-full rounded-[14px] theme-skeleton" />
            <div className="mt-2.5 flex gap-1.5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-9 w-9 shrink-0 rounded-lg theme-skeleton"
                    />
                ))}
            </div>
            <div className="mt-3">
                <div className="h-3 w-24 rounded theme-skeleton" />
                <div className="mt-1.5 h-4 w-3/4 rounded theme-skeleton" />
                <div className="mt-1 h-4 w-16 rounded theme-skeleton" />
            </div>
            <div className="mt-3.5 flex gap-2">
                <div className="h-12 flex-1 rounded-[10px] theme-skeleton" />
                <div className="h-12 w-12 rounded-[10px] theme-skeleton" />
            </div>
        </div>
    </div>
);

export default ProductCardSkeleton;
