import { useEffect, useMemo, useState } from "react";

import { Eye, Funnel, Package, RotateCcw, Search } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { postsApi } from "../../api/postsApi";
import Alert from "../../components/Alert";
import DataTable from "../../components/DataTable.jsx";

const AllPosts = () => {
    const navigate = useNavigate();

    const initialFilters = {
        status: "",
        from_date: "",
        to_date: "",
    };

    const [posts, setPosts] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    const normalizeList = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        return [];
    };

    const cleanFilters = () => {
        const params = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params[key] = value;
            }
        });

        return params;
    };

    const getPostContent = (post) => {
        return post.content || post.description || "";
    };

    const getMainImageUrl = (post) => {
        return post.main_image_url || post.main_image || "";
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (post) => {
        if (
            post.price === null ||
            post.price === undefined ||
            post.price === ""
        ) {
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
            return "bg-green-100 text-green-700";
        }

        if (status === "rejected") {
            return "bg-red-100 text-red-700";
        }

        if (status === "pending") {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-theme-surface-soft text-content-secondary";
    };

    const fetchPosts = async (customFilters = null) => {
        try {
            setLoadingPosts(true);
            setError("");

            const response = await postsApi.getPosts(
                customFilters ?? cleanFilters()
            );

            setPosts(normalizeList(response));
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
        fetchPosts({});
    }, []);

    const stats = useMemo(() => {
        return {
            total: posts.length,

            published: posts.filter(
                (post) =>
                    post.status === "published" || post.status === "approved"
            ).length,

            pending: posts.filter((post) => post.status === "pending").length,

            rejected: posts.filter((post) => post.status === "rejected").length,
        };
    }, [posts]);

    const updateFilter = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        await fetchPosts();
    };

    const clearFilters = async () => {
        setFilters(initialFilters);
        await fetchPosts({});
    };

    const renderStatusBadge = (status) => {
        return (
            <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                    status
                )}`}
            >
                {status || "N/A"}
            </span>
        );
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
                header: "Status",
                accessor: "status",

                render: (post) => renderStatusBadge(post.status),
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
        <div>
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <span className="rounded-full bg-brand-orange/10 px-4 py-2 text-sm font-semibold text-brand-orange">
                        Products
                    </span>

                    <h1 className="mt-5 text-2xl font-extrabold text-content">
                        Products
                    </h1>

                    <p className="mt-2 text-sm text-content-muted">
                        Filter, review, and manage product listings.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    aria-label={
                        filtersOpen
                            ? "Close product filters"
                            : "Open product filters"
                    }
                    aria-expanded={filtersOpen}
                    title={filtersOpen ? "Close filters" : "Open filters"}
                    className={[
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl border shadow-sm transition",
                        filtersOpen
                            ? "border-brand-orange bg-brand-orange text-white"
                            : "border-line bg-theme-surface text-brand-green hover:border-brand-orange hover:text-brand-orange",
                    ].join(" ")}
                >
                    <Funnel size={19} />
                </button>
            </div>

            <Alert type="error" message={error} />

            {filtersOpen && (
                <form
                    onSubmit={handleSearch}
                    className="mb-6 rounded-2xl border border-line bg-theme-surface p-5 shadow-sm"
                >
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-content">
                            Filter Products
                        </h2>

                        <p className="mt-1 text-sm text-content-muted">
                            Use status and date filters to find matching
                            products.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-content-secondary">
                                Status
                            </label>

                            <select
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                                className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            >
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="published">Published</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-content-secondary">
                                From Date
                            </label>

                            <input
                                type="date"
                                name="from_date"
                                value={filters.from_date}
                                onChange={updateFilter}
                                className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-content-secondary">
                                To Date
                            </label>

                            <input
                                type="date"
                                name="to_date"
                                value={filters.to_date}
                                onChange={updateFilter}
                                className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong px-5 py-3 text-sm font-medium text-content-secondary hover:bg-theme-surface-soft"
                        >
                            <RotateCcw size={16} />
                            Clear
                        </button>

                        <button
                            type="submit"
                            disabled={loadingPosts}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-orange/90 disabled:opacity-50"
                        >
                            <Search size={16} />

                            {loadingPosts ? "Searching..." : "Search Products"}
                        </button>
                    </div>
                </form>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">Results</p>

                    <p className="mt-2 text-3xl font-semibold text-content">
                        {stats.total}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">
                        Published
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-green-600">
                        {stats.published}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">Pending</p>

                    <p className="mt-2 text-3xl font-semibold text-yellow-600">
                        {stats.pending}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                    <p className="text-sm font-medium text-content-muted">
                        Rejected
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-red-600">
                        {stats.rejected}
                    </p>
                </div>
            </div>

            <DataTable
                title="All Products"
                subtitle="Open a product to review its complete details on a dedicated page."
                columns={columns}
                data={posts}
                loading={loadingPosts}
                rowKey="id"
                searchable
                onRefresh={() => fetchPosts()}
                refreshLoading={loadingPosts}
                exportable
                printable
                searchPlaceholder="Search by product name, category, brand, SKU, status, or description..."
                emptyText="No products found."
                actions={(post) => (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/admin/posts/${post.id}`, {
                                state: {
                                    post,
                                },
                            })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-orange px-3 py-1.5 text-xs font-semibold text-brand-orange transition hover:bg-brand-orange hover:text-white"
                    >
                        <Eye size={13} />
                        View Details
                    </button>
                )}
            />
        </div>
    );
};

export default AllPosts;
