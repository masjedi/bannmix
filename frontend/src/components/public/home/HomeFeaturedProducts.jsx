import { ArrowRight, Package } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../products/ProductCard";
import ProductCardSkeleton from "../products/ProductCardSkeleton";
import {
    ButtonLink,
    Container,
    FadeUp,
    PageSection,
    PublicCard,
    SectionHeading,
} from "../ui";

const HomeFeaturedProducts = ({
    label,
    title,
    description,
    products = [],
    loading = false,
    emptyLabel,
    viewAllLabel,
    viewProductLabel,
    orderNowLabel,
    priceOnRequest,
    viewDetailsLabel,
    imagesLabel,
    addFavoriteLabel,
    removeFavoriteLabel,
    translate,
}) => (
    <PageSection
        id="featured-products"
        border={false}
        className="home-featured home-section-compact home-section-soft"
    >
        <Container>
            <FadeUp>
                <SectionHeading
                    label={label}
                    title={title}
                    description={description}
                />
            </FadeUp>

            {loading ? (
                <div
                    className="home-featured-grid mt-8"
                    aria-busy="true"
                    aria-live="polite"
                >
                    {Array.from({ length: 3 }).map((_, index) => (
                        <ProductCardSkeleton key={index} compact />
                    ))}
                    <p className="sr-only">{emptyLabel}</p>
                </div>
            ) : products.length === 0 ? (
                <FadeUp className="mt-8">
                    <PublicCard className="text-center">
                        <Package
                            size={36}
                            className="mx-auto text-brand-orange/50"
                            aria-hidden="true"
                        />
                        <p className="mt-3 text-sm font-semibold text-content-secondary">
                            {emptyLabel}
                        </p>
                        <ButtonLink
                            to="/products"
                            variant="secondary"
                            className="mt-5"
                        >
                            {viewAllLabel}
                        </ButtonLink>
                    </PublicCard>
                </FadeUp>
            ) : (
                <FadeUp delay={60}>
                    <div className="home-featured-grid mt-8">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                translate={translate}
                                eager={index === 0}
                                compact
                                showDescription
                                showViewProduct
                                showFavorite={false}
                                showThumbs={false}
                                headingLevel="h3"
                                copy={{
                                    viewDetails: viewDetailsLabel,
                                    viewProduct: viewProductLabel,
                                    orderNow: orderNowLabel,
                                    priceOnRequest,
                                    imagesLabel,
                                    addFavorite: addFavoriteLabel,
                                    removeFavorite: removeFavoriteLabel,
                                }}
                            />
                        ))}
                    </div>
                </FadeUp>
            )}

            {products.length > 0 ? (
                <FadeUp className="home-featured-more">
                    <Link to="/products" className="home-about-link">
                        {viewAllLabel}
                        <ArrowRight
                            size={15}
                            className="home-about-link-arrow rtl:rotate-180"
                            aria-hidden="true"
                        />
                    </Link>
                </FadeUp>
            ) : null}
        </Container>
    </PageSection>
);

export default HomeFeaturedProducts;
