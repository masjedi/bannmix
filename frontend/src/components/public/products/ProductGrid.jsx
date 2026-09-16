const ProductGrid = ({ children }) => (
    <div className="grid w-full grid-cols-1 items-start justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
        {children}
    </div>
);

export default ProductGrid;
