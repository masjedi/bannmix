import { Star } from "lucide-react";

import {
    formatProductRating,
    getProductRating,
    getProductReviewCount,
} from "./productUtils";

const ProductRating = ({
    product,
    size = 14,
    showCount = true,
    className = "",
}) => {
    const rating = getProductRating(product);
    const reviewCount = getProductReviewCount(product);

    if (reviewCount <= 0) {
        return null;
    }

    return (
        <span
            className={[
                "inline-flex items-center gap-1 text-content-secondary",
                className,
            ].join(" ")}
        >
            <Star size={size} className="fill-brand-orange text-brand-orange" />
            <span className="font-medium">{formatProductRating(rating)}</span>
            {showCount ? (
                <span className="text-content-muted">({reviewCount})</span>
            ) : null}
        </span>
    );
};

export default ProductRating;
