const ProductGrid = ({ children }) => (
    <div className="product-grid grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {children}
    </div>
);

export default ProductGrid;
