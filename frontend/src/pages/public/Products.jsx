import { useCallback, useEffect, useMemo, useState } from "react";

import { RefreshCw } from "lucide-react";

import { publicProductsApi } from "../../api/publicProductsApi";
import { Container, PublicPage } from "../../components/public/ui";
import ProductCard from "../../components/public/products/ProductCard";
import ProductCardSkeleton from "../../components/public/products/ProductCardSkeleton";
import ProductEmptyState from "../../components/public/products/ProductEmptyState";
import ProductGrid from "../../components/public/products/ProductGrid";
import InnerPageHero from "../../components/public/InnerPageHero";
import ProductPagination from "../../components/public/products/ProductPagination";
import ProductToolbar from "../../components/public/products/ProductToolbar";
import WholesaleCTA from "../../components/public/products/WholesaleCTA";
import {
    CATALOG_ID,
    WHOLESALE_ID,
} from "../../components/public/products/productUtils";
import { useLanguage } from "../../context/LanguageContext";
import publicTranslations, {
    ORDER_CONTACTS,
} from "../../i18n/publicTranslations";

const useDebounce = (value, delay = 350) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
};

const Products = () => {
    const { translate } = useLanguage();
    const t = publicTranslations.products;

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        page: 1,
        per_page: 12,
        sort: "latest",
    });
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const debouncedSearch = useDebounce(filters.search);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await publicProductsApi.getProducts({
                search: debouncedSearch || undefined,
                category: filters.category || undefined,
                page: filters.page,
                per_page: filters.per_page,
                sort: filters.sort,
            });

            const list =
                response?.data?.data ||
                response?.data ||
                (Array.isArray(response) ? response : []);

            const pagination = response?.data?.meta || response?.meta || null;
            const nextProducts = Array.isArray(list) ? list : [];

            setProducts(nextProducts);
            setMeta(pagination);

            setCategories((current) => {
                const next = new Set(current);
                nextProducts.forEach((item) => {
                    if (item?.category) next.add(item.category);
                });
                return Array.from(next).sort();
            });

        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Unable to load products right now."
            );
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [
        debouncedSearch,
        filters.category,
        filters.page,
        filters.per_page,
        filters.sort,
    ]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const totalPages = useMemo(() => {
        if (!meta?.last_page) return 1;
        return meta.last_page;
    }, [meta]);

    const totalCount = meta?.total ?? products.length;

    const resultLabel = useMemo(() => {
        if (filters.search.trim()) {
            return translate({
                en: `${totalCount} results for “${filters.search.trim()}”`,
                ps: `${totalCount} پایلې د «${filters.search.trim()}» لپاره`,
                fa: `${totalCount} نتیجه برای «${filters.search.trim()}»`,
            });
        }

        if (filters.category) {
            return translate({
                en: `Showing ${totalCount} products in “${filters.category}”`,
                ps: `${totalCount} محصولات په «${filters.category}» کې ښودل شوي`,
                fa: `نمایش ${totalCount} محصول در «${filters.category}»`,
            });
        }

        return translate({
            en: `${totalCount} Products`,
            ps: `${totalCount} محصولات`,
            fa: `${totalCount} محصول`,
        });
    }, [filters.category, filters.search, totalCount, translate]);

    const sortLabels = {
        latest: translate(t.sortFeatured),
        oldest: translate(t.sortOldest),
        price_asc: translate(t.sortPriceAsc),
        price_desc: translate(t.sortPriceDesc),
        title_asc: translate(t.sortTitleAsc),
        title_desc: translate(t.sortTitleDesc),
    };

    const updateFilters = (patch) => {
        setFilters((current) => ({
            ...current,
            ...patch,
        }));
    };

    const clearFilters = () => {
        updateFilters({
            search: "",
            category: "",
            page: 1,
        });
    };

    const hasActiveFilters = Boolean(
        filters.search.trim() || filters.category
    );

    return (
        <PublicPage className="products-catalog">
            <InnerPageHero
                eyebrow={translate(t.heroLabel)}
                title={translate(t.heroTitle)}
                description={translate(t.heroBody)}
                primaryAction={{
                    label: translate(t.browseProducts),
                    href: `#${CATALOG_ID}`,
                }}
                secondaryAction={{
                    label: translate(t.wholesaleInquiry),
                    href: `#${WHOLESALE_ID}`,
                }}
            />

            <section
                id={CATALOG_ID}
                className="scroll-mt-24 bg-theme-page py-10 sm:py-12"
            >
                <Container>
                    <ProductToolbar
                        resultLabel={resultLabel}
                        searchLabel={translate(t.searchLabel)}
                        searchPlaceholder={translate(t.searchPlaceholder)}
                        searchValue={filters.search}
                        onSearchChange={(search) =>
                            updateFilters({ search, page: 1 })
                        }
                        categoryLabel={translate(t.categoryLabel)}
                        allCategoriesLabel={translate(t.allCategories)}
                        categories={categories}
                        categoryValue={filters.category}
                        onCategoryChange={(category) =>
                            updateFilters({ category, page: 1 })
                        }
                        sortLabel={translate(t.sortLabel)}
                        sortValue={filters.sort}
                        onSortChange={(sort) =>
                            updateFilters({ sort, page: 1 })
                        }
                        sortLabels={sortLabels}
                    />

                    {error && (
                        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={loadProducts}
                                className="inline-flex min-h-11 items-center justify-center gap-1 font-semibold text-brand-blue focus-visible:outline-brand-blue"
                            >
                                <RefreshCw size={14} aria-hidden="true" />
                                {translate(t.retry)}
                            </button>
                        </div>
                    )}

                    <div className="mt-6" aria-busy={loading}>
                        {loading ? (
                            <>
                                <span className="sr-only">
                                    {translate(t.loading)}
                                </span>
                                <ProductGrid>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <ProductCardSkeleton
                                            key={`skeleton-${index}`}
                                        />
                                    ))}
                                </ProductGrid>
                            </>
                        ) : products.length === 0 ? (
                            <ProductEmptyState
                                title={translate(t.emptyTitle)}
                                description={translate(t.emptyBody)}
                                actionLabel={
                                    hasActiveFilters
                                        ? translate(t.clearFilters)
                                        : ""
                                }
                                onClear={
                                    hasActiveFilters ? clearFilters : undefined
                                }
                            />
                        ) : (
                            <ProductGrid>
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        translate={translate}
                                        eager={index < 3}
                                        copy={{
                                            viewDetails: translate(
                                                t.viewDetails
                                            ),
                                            orderNow: translate(
                                                publicTranslations.common
                                                    .orderNow
                                            ),
                                            priceOnRequest: translate(
                                                t.priceOnRequest
                                            ),
                                            imagesLabel: translate(t.images),
                                            addFavorite: translate(
                                                t.addFavorite
                                            ),
                                            removeFavorite: translate(
                                                t.removeFavorite
                                            ),
                                        }}
                                    />
                                ))}
                            </ProductGrid>
                        )}
                    </div>

                    {!loading && (
                        <ProductPagination
                            page={filters.page}
                            totalPages={totalPages}
                            onPageChange={(page) => updateFilters({ page })}
                            previousLabel={translate(t.previous)}
                            nextLabel={translate(t.next)}
                            paginationLabel={translate(t.paginationLabel)}
                        />
                    )}
                </Container>
            </section>

            <WholesaleCTA
                label={translate(t.wholesaleLabel)}
                title={translate(t.wholesaleTitle)}
                description={translate(t.wholesaleBody)}
                whatsappLabel={translate(
                    publicTranslations.common.whatsappOrder
                )}
                contactLabel={translate(t.contactSales)}
                contactHref={ORDER_CONTACTS.phoneHref}
                translate={translate}
            />
        </PublicPage>
    );
};

export default Products;
