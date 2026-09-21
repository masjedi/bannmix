import { useEffect, useMemo, useState } from "react";

import {
    Funnel,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { postsApi } from "../../api/postsApi";
import Alert from "../../components/Alert";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal";
import ProductForm from "../../components/admin/products/ProductForm";
import { htmlToPlainText } from "../../utils/htmlText";

const AllPosts = () => {
    const navigate = useNavigate();

    const initialFilters = {
        status: "",
        from_date: "",
        to_date: "",
    };

    const [posts, setPosts] = useState([]);
    const [postStats, setPostStats] = useState(null);
    const [paginationMeta, setPaginationMeta] = useState(null);
    const [tablePage, setTablePage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(25);
    const [filters, setFilters] = useState(initialFilters);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formOpen, setFormOpen] = useState(false);

    const normalizeList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    };

    const normalizeMeta = (data) => data?.meta ?? null;

    const cleanFilters = () => {
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        return params;
    };

    const getPostContent = (post) =>
        post.excerpt ||
        htmlToPlainText(post.content || post.description || "");

    const getMainImageUrl = (post) => post.main_image_url || post.main_image || "";

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatPrice = (post) => {
        if (post.price === null || post.price === undefined || post.price === "") {
            return "N/A";
        }

        const amount = Number(post.price);
        if (post.currency === "USD" && !Number.isNaN(amount)) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);
        }

        return `${post.currency || ""} ${
            Number.isNaN(amount) ? post.price : amount.toLocaleString("en-US")
        }`.trim();
    };

    const getStatusClass = (status) => {
        if (status === "published" || status === "approved") {
            return "bg-theme-success-bg text-theme-success-text";
        }
        if (status === "rejected") return "bg-red-100 text-red-700";
        if (status === "pending") return "bg-amber-100 text-amber-800";
        return "bg-theme-surface-soft text-content-secondary";
    };

    const fetchPostStats = async () => {
        try {
            const stats = await postsApi.getPostStats();
            setPostStats(stats);
        } catch {
            // Stats cards can fall back to pagination totals.
        }
    };

    const fetchPosts = async ({
        customFilters = null,
        page = tablePage,
        perPage = tablePageSize,
    } = {}) => {
        try {
            setLoadingPosts(true);
            setError("");
            const response = await postsApi.getPosts({
                ...(customFilters ?? cleanFilters()),
                page,
                per_page: perPage,
            });
            setPosts(normalizeList(response));
            setPaginationMeta(normalizeMeta(response));
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    requestError.message ||
                    "Failed to load products."
            );
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        fetchPostStats();
    }, []);

    useEffect(() => {
        fetchPosts({ page: tablePage, perPage: tablePageSize });
    }, [tablePage, tablePageSize]);

    const stats = useMemo(
        () => ({
            total: postStats?.total ?? paginationMeta?.total ?? 0,
            published: postStats?.published ?? 0,
            pending: postStats?.pending ?? 0,
            rejected: postStats?.rejected ?? 0,
        }),
        [postStats, paginationMeta]
    );

    const updateFilter = (event) => {
        const { name, value } = event.target;
        setFilters((previous) => ({ ...previous, [name]: value }));
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setTablePage(1);
        await fetchPosts({ page: 1, perPage: tablePageSize });
    };

    const clearFilters = async () => {
        setFilters(initialFilters);
        setTablePage(1);
        await fetchPosts({
            customFilters: {},
            page: 1,
            perPage: tablePageSize,
        });
    };

    const handleCreate = async (payload) => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await postsApi.createPost(payload);
            setFormOpen(false);
            setSuccess("Product created.");
            await Promise.all([fetchPosts(), fetchPostStats()]);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not create the product."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (post) => {
        if (!window.confirm(`Delete “${post.title || "this product"}”?`)) {
            return;
        }

        try {
            await postsApi.deletePost(post.id);
            setSuccess("Product deleted.");
            await Promise.all([fetchPosts(), fetchPostStats()]);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not delete the product."
            );
        }
    };

    const columns = useMemo(
        () => [
            {
                header: "Product",
                accessor: "title",
                render: (post) => {
                    const imageUrl = getMainImageUrl(post);
                    return (
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-theme-surface-soft">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={post.title || "Product"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="grid h-full w-full place-items-center text-content-muted">
                                        <Package size={18} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-content">
                                    {post.title || "Untitled Product"}
                                </p>
                                <p className="mt-1 max-w-xl truncate text-sm text-content-muted">
                                    {getPostContent(post) || "No description"}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                header: "Category",
                accessor: "category",
                render: (post) => (
                    <span className="text-sm text-content-secondary">
                        {typeof post.category === "string"
                            ? post.category
                            : post.category?.name || "—"}
                    </span>
                ),
            },
            {
                header: "Status",
                accessor: "status",
                render: (post) => (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                            post.status
                        )}`}
                    >
                        {post.status || "N/A"}
                    </span>
                ),
            },
            {
                header: "Price",
                accessor: "price",
                render: (post) => (
                    <span className="text-sm text-content-secondary">
                        {formatPrice(post)}
                    </span>
                ),
            },
            {
                header: "Created",
                accessor: "created_at",
                render: (post) => (
                    <span className="text-sm text-content-secondary">
                        {formatDate(post.created_at)}
                    </span>
                ),
            },
        ],
        []
    );

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                        <Package size={14} />
                        Catalog
                    </div>
                    <h1 className="type-admin-page-title mt-3 text-content">
                        Products
                    </h1>
                    <p className="mt-1 text-sm text-content-muted">
                        Create and manage products shown on the public catalog.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((open) => !open)}
                        aria-label={
                            filtersOpen ? "Close product filters" : "Open product filters"
                        }
                        className={[
                            "grid h-10 w-10 place-items-center rounded-lg border transition",
                            filtersOpen
                                ? "border-brand-orange bg-brand-orange text-white"
                                : "border-line bg-theme-surface text-content-secondary hover:border-brand-orange hover:text-brand-orange",
                        ].join(" ")}
                    >
                        <Funnel size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setFormOpen(true);
                        }}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-semibold text-white shadow-sm shadow-brand-orange/20 transition hover:bg-brand-orange/90"
                    >
                        <Plus size={16} />
                        Add Product
                    </button>
                </div>
            </div>

            <Alert type="error" message={formOpen ? "" : error} />
            <Alert type="success" message={success} />

            {filtersOpen ? (
                <form
                    onSubmit={handleSearch}
                    className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            Status
                            <select
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                                className="h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            >
                                <option value="">All statuses</option>
                                <option value="pending">Draft</option>
                                <option value="published">Published</option>
                                <option value="rejected">Hidden</option>
                            </select>
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            From date
                            <input
                                type="date"
                                name="from_date"
                                value={filters.from_date}
                                onChange={updateFilter}
                                className="h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>
                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            To date
                            <input
                                type="date"
                                name="to_date"
                                value={filters.to_date}
                                onChange={updateFilter}
                                className="h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-content-secondary hover:bg-theme-page"
                        >
                            <RotateCcw size={15} />
                            Clear
                        </button>
                        <button
                            type="submit"
                            disabled={loadingPosts}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            <Search size={15} />
                            Search
                        </button>
                    </div>
                </form>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="type-admin-stat-label text-content-muted">Total</p>
                    <p className="type-admin-stat-value mt-2 text-content">
                        {stats.total}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="type-admin-stat-label text-content-muted">
                        Published
                    </p>
                    <p className="type-admin-stat-value mt-2 text-theme-success-text">
                        {stats.published}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="type-admin-stat-label text-content-muted">
                        Draft
                    </p>
                    <p className="type-admin-stat-value mt-2 text-amber-700">
                        {stats.pending}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="type-admin-stat-label text-content-muted">
                        Hidden
                    </p>
                    <p className="type-admin-stat-value mt-2 text-red-600">
                        {stats.rejected}
                    </p>
                </div>
            </div>

            <DataTable
                title="All Products"
                subtitle="Products listed here appear on the public Products page."
                columns={columns}
                data={posts}
                loading={loadingPosts}
                rowKey="id"
                searchable
                paginationMeta={paginationMeta}
                onPageChange={(nextPage) => setTablePage(nextPage)}
                onPageSizeChange={(nextPageSize) => {
                    setTablePageSize(nextPageSize);
                    setTablePage(1);
                }}
                onRefresh={() =>
                    fetchPosts({ page: tablePage, perPage: tablePageSize })
                }
                refreshLoading={loadingPosts}
                exportable
                printable
                searchPlaceholder="Search products..."
                emptyText="No products yet. Click Add Product to create one."
                actions={(post) => (
                    <>
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/posts/${post.id}`)}
                            title="View and edit"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-content-secondary transition hover:border-brand-orange hover:bg-brand-orange/5 hover:text-brand-orange"
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(post)}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2 size={15} />
                        </button>
                    </>
                )}
            />

            <Modal
                open={formOpen}
                title="Add Product"
                size="lg"
                closeDisabled={saving}
                onClose={() => {
                    if (!saving) setFormOpen(false);
                }}
            >
                <ProductForm
                    saving={saving}
                    error={error && formOpen ? error : ""}
                    submitLabel="Create product"
                    onCancel={() => setFormOpen(false)}
                    onSubmit={handleCreate}
                />
            </Modal>
        </section>
    );
};

export default AllPosts;
