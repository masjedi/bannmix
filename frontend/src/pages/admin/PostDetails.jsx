import { useEffect, useMemo, useState } from "react";

import {
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    Copy,
    CreditCard,
    FileText,
    Globe,
    Hash,
    Heart,
    Link2,
    LoaderCircle,
    Mail,
    MessageCircle,
    Minus,
    Package,
    Plus,
    Send,
    ShieldCheck,
    Star,
    Store,
    Truck,
    User,
    XCircle,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { postsApi } from "../../api/postsApi";

const TAB_ITEMS = [
    {
        key: "description",
        label: "Description",
    },
    {
        key: "specifications",
        label: "Specifications",
    },
    {
        key: "technical",
        label: "Technical Specs",
    },
    {
        key: "reviews",
        label: "Reviews",
    },
];

const normalizeList = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};

const getOwnerName = (post) => {
    return (
        post?.user?.name ||
        post?.client?.name ||
        post?.client_name ||
        "Unassigned"
    );
};

const getOwnerEmail = (post) => {
    return (
        post?.user?.email || post?.client?.email || post?.client_email || "N/A"
    );
};

const getPostContent = (post) => {
    return post?.content || post?.description || "";
};

const getRejectReason = (post) => {
    return (
        post?.reject_reason || post?.rejection_reason || post?.admin_note || ""
    );
};

const getMainImageUrl = (post) => {
    return post?.main_image_url || post?.main_image || "";
};

const getGalleryImageUrls = (post) => {
    const gallery = Array.isArray(post?.gallery_image_urls)
        ? post.gallery_image_urls
        : Array.isArray(post?.gallery_images)
        ? post.gallery_images
        : [];

    return gallery
        .map((image) => {
            if (typeof image === "string") {
                return image;
            }

            return image?.url || image?.file_url || image?.path || "";
        })
        .filter(Boolean);
};

const getCategoryName = (post) => {
    return post?.category?.name || post?.category || "Uncategorized";
};

const getBrandName = (post) => {
    return post?.brand?.name || post?.brand || "No brand";
};

const getStatusClass = (status) => {
    switch (status) {
        case "published":
        case "approved":
            return "border-theme-success-text/20 bg-theme-success-bg text-theme-success-text";

        case "rejected":
            return "border-red-200 bg-red-50 text-red-700";

        case "pending":
            return "border-brand-orange/25 bg-brand-orange/10 text-brand-orange";

        case "draft":
            return "border-line bg-theme-surface-soft text-content-secondary";

        default:
            return "border-line bg-theme-page text-content-secondary";
    }
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
        post?.price === null ||
        post?.price === undefined ||
        post?.price === ""
    ) {
        return "N/A";
    }

    const amount = Number(post.price);
    const currency = post.currency || "AFN";

    if (Number.isNaN(amount)) {
        return `${post.price} ${currency}`.trim();
    }

    if (currency === "USD") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    }

    return `${amount.toLocaleString("en-US")} ${currency}`;
};

const formatBooleanLike = (value) => {
    if (value === true || value === 1 || value === "1" || value === "yes") {
        return "Yes";
    }

    if (value === false || value === 0 || value === "0" || value === "no") {
        return "No";
    }

    return value || "N/A";
};

const getStockQuantity = (post) => {
    const value = post?.stock_quantity ?? post?.stock ?? post?.quantity ?? 0;

    const parsed = Number(value);

    return Number.isNaN(parsed) ? 0 : parsed;
};

const getRating = (post) => {
    const parsed = Number(post?.rating ?? post?.average_rating ?? 0);

    if (Number.isNaN(parsed)) {
        return 0;
    }

    return Math.min(Math.max(parsed, 0), 5);
};

const getReviewCount = (post) => {
    const parsed = Number(post?.review_count ?? post?.reviews_count ?? 0);

    return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeColorOptions = (post) => {
    const rawColors = Array.isArray(post?.colors)
        ? post.colors
        : Array.isArray(post?.color_options)
        ? post.color_options
        : post?.color
        ? [post.color]
        : [];

    return rawColors
        .map((color, index) => {
            if (typeof color === "string") {
                const isHex =
                    color.startsWith("#") ||
                    color.startsWith("rgb") ||
                    color.startsWith("hsl");

                return {
                    id: `${color}-${index}`,
                    name: color,
                    value: isHex ? color : "#E86E2B",
                };
            }

            return {
                id: color?.id || `${color?.name || "color"}-${index}`,
                name: color?.name || color?.label || `Color ${index + 1}`,
                value: color?.hex || color?.value || color?.color || "#E86E2B",
            };
        })
        .filter(Boolean);
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                status
            )}`}
        >
            <CircleCheck size={13} />
            {status || "N/A"}
        </span>
    );
};

const Breadcrumb = ({ category, brand, title, onBack }) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-2 text-sm"
        >
            <button
                type="button"
                onClick={onBack}
                className="font-medium text-brand-orange transition hover:text-brand-orange/80"
            >
                Home
            </button>

            <span className="text-content-muted">/</span>

            <span className="font-medium text-brand-orange">{category}</span>

            <span className="text-content-muted">/</span>

            <span className="font-medium text-brand-orange">{brand}</span>

            <span className="text-content-muted">/</span>

            <span className="font-medium text-content">{title}</span>
        </nav>
    );
};

const Rating = ({ rating, reviewCount }) => {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                        key={index}
                        size={17}
                        strokeWidth={2}
                        className={
                            index < Math.round(rating)
                                ? "fill-brand-orange text-brand-orange"
                                : "text-brand-orange/40"
                        }
                    />
                ))}
            </div>

            <span className="text-sm text-content-muted">
                ({reviewCount} Review
                {reviewCount === 1 ? "" : "s"})
            </span>
        </div>
    );
};

const ImageGallery = ({ title, images, currentIndex, onChange, featured }) => {
    const currentImage = images[currentIndex] || "";

    const previous = () => {
        if (images.length < 2) {
            return;
        }

        onChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const next = () => {
        if (images.length < 2) {
            return;
        }

        onChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    return (
        <div className="min-w-0">
            <div className="rounded-[26px] border border-brand-orange/15 bg-theme-surface p-2 shadow-sm">
                <div className="relative flex min-h-[470px] items-center justify-center overflow-hidden rounded-[22px] bg-brand-cream sm:min-h-[560px]">
                    {featured && (
                        <span className="absolute left-4 top-4 z-10 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white">
                            Featured
                        </span>
                    )}

                    {currentImage ? (
                        <img
                            src={currentImage}
                            alt={title}
                            className="h-full max-h-[570px] w-full object-contain p-8 sm:p-12"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-content-muted">
                            <Package size={90} strokeWidth={1.2} />

                            <p className="mt-4 text-sm font-semibold text-content-muted">
                                No product image available
                            </p>
                        </div>
                    )}

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={previous}
                                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-theme-surface text-content-secondary shadow-md transition hover:text-brand-orange"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={21} />
                            </button>

                            <button
                                type="button"
                                onClick={next}
                                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-theme-surface text-content-secondary shadow-md transition hover:text-brand-orange"
                                aria-label="Next image"
                            >
                                <ChevronRight size={21} />
                            </button>
                        </>
                    )}

                    {images.length > 0 && (
                        <span className="absolute bottom-4 right-4 rounded-full bg-theme-page/75 px-3 py-1.5 text-xs font-bold text-white">
                            {currentIndex + 1} / {images.length}
                        </span>
                    )}
                </div>
            </div>

            {images.length > 0 && (
                <div className="mt-3 rounded-[24px] border border-brand-orange/15 bg-theme-surface p-3 shadow-sm">
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {images.map((imageUrl, index) => (
                            <button
                                key={`${imageUrl}-${index}`}
                                type="button"
                                onClick={() => onChange(index)}
                                className={[
                                    "h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 bg-brand-cream p-1 transition",
                                    index === currentIndex
                                        ? "border-brand-orange shadow-sm"
                                        : "border-line hover:border-brand-orange/40",
                                ].join(" ")}
                                aria-label={`Select image ${index + 1}`}
                            >
                                <img
                                    src={imageUrl}
                                    alt={`${title} ${index + 1}`}
                                    className="h-full w-full rounded-xl object-contain"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const QuantitySelector = ({ quantity, onChange }) => {
    return (
        <div className="flex h-12 items-center rounded-xl border border-line bg-theme-surface">
            <button
                type="button"
                onClick={() => onChange(Math.max(1, quantity - 1))}
                className="grid h-full w-12 place-items-center text-content-muted transition hover:text-brand-orange"
                aria-label="Decrease quantity"
            >
                <Minus size={17} />
            </button>

            <span className="grid h-full min-w-14 place-items-center border-x border-line text-sm font-semibold text-content">
                {quantity}
            </span>

            <button
                type="button"
                onClick={() => onChange(quantity + 1)}
                className="grid h-full w-12 place-items-center text-content-muted transition hover:text-brand-orange"
                aria-label="Increase quantity"
            >
                <Plus size={17} />
            </button>
        </div>
    );
};

const ShareButton = ({ label, icon: Icon, onClick, children }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-xl border border-brand-orange/25 bg-theme-surface text-content-secondary transition hover:border-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange"
        >
            {Icon ? <Icon size={15} /> : children}
        </button>
    );
};

const DetailTable = ({ rows }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-line">
            <table className="min-w-full border-collapse">
                <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                        <tr
                            key={row.label}
                            className="transition hover:bg-brand-orange/10/30"
                        >
                            <th
                                scope="row"
                                className="w-[38%] bg-theme-page/70 px-5 py-4 text-left text-sm font-semibold text-content-secondary"
                            >
                                {row.label}
                            </th>

                            <td className="px-5 py-4 text-sm font-medium text-content">
                                {row.value || "N/A"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PostDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [post, setPost] = useState(location.state?.post || null);

    const [rejectReason, setRejectReason] = useState(
        getRejectReason(location.state?.post)
    );

    const [loading, setLoading] = useState(!location.state?.post);

    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [activeTab, setActiveTab] = useState("description");

    const [quantity, setQuantity] = useState(1);
    const [favorite, setFavorite] = useState(false);
    const [selectedColor, setSelectedColor] = useState("");

    const canReviewPost = post?.status === "pending";

    const loadPost = async () => {
        try {
            setLoading(true);
            setError("");

            let loadedPost = null;

            if (typeof postsApi.getPost === "function") {
                const response = await postsApi.getPost(id);

                loadedPost = response?.data || response;
            } else {
                const response = await postsApi.getPosts();

                loadedPost = normalizeList(response).find(
                    (item) => String(item.id) === String(id)
                );
            }

            if (!loadedPost) {
                throw new Error("The requested post could not be found.");
            }

            setPost(loadedPost);
            setRejectReason(getRejectReason(loadedPost));
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Unable to load post details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!post || String(post.id) !== String(id)) {
            loadPost();
        }
    }, [id]);

    const images = useMemo(() => {
        if (!post) {
            return [];
        }

        return [
            ...new Set(
                [getMainImageUrl(post), ...getGalleryImageUrls(post)].filter(
                    Boolean
                )
            ),
        ];
    }, [post]);

    const colorOptions = useMemo(() => normalizeColorOptions(post), [post]);

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [images]);

    useEffect(() => {
        setSelectedColor(colorOptions[0]?.id || "");
    }, [colorOptions]);

    useEffect(() => {
        const minimum = Number(post?.moq || 1);

        setQuantity(Number.isNaN(minimum) || minimum < 1 ? 1 : minimum);
    }, [post?.moq]);

    const updatePostStatus = async (status) => {
        if (!post) {
            return;
        }

        if (status === "rejected" && !rejectReason.trim()) {
            setError(
                "Please enter a rejection reason before rejecting the post."
            );
            setActiveTab("reviews");
            return;
        }

        try {
            setUpdating(true);
            setError("");
            setMessage("");

            const payload = { status };

            if (status === "rejected") {
                payload.reject_reason = rejectReason.trim();

                payload.rejection_reason = rejectReason.trim();

                payload.admin_note = rejectReason.trim();
            }

            const response = await postsApi.updatePost(post.id, payload);

            const updatedPost = response?.data || response;

            setPost((previous) => ({
                ...previous,
                ...(updatedPost && typeof updatedPost === "object"
                    ? updatedPost
                    : {}),
                status,
                ...(status === "rejected"
                    ? {
                          reject_reason: rejectReason.trim(),
                      }
                    : {}),
            }));

            setMessage(
                status === "published"
                    ? "The post was published successfully."
                    : "The post was rejected successfully."
            );
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Failed to update post status."
            );
        } finally {
            setUpdating(false);
        }
    };

    const copyCurrentUrl = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setMessage("Product link copied to the clipboard.");
        } catch {
            setError("Unable to copy the product link.");
        }
    };

    const specificationRows = useMemo(
        () => [
            {
                label: "Product Name",
                value: post?.title || post?.name || "Untitled Post",
            },
            {
                label: "Category",
                value: getCategoryName(post),
            },
            {
                label: "Brand",
                value: getBrandName(post),
            },
            {
                label: "Stock Keeping Unit / Model Number",
                value: post?.sku,
            },
            {
                label: "Minimum Order Quantity",
                value:
                    post?.moq !== null &&
                    post?.moq !== undefined &&
                    post?.moq !== ""
                        ? `${Number(post.moq).toLocaleString("en-US")} ${
                              post?.unit || ""
                          }`
                        : "N/A",
            },
            {
                label: "Country of Origin",
                value: post?.country_of_origin,
            },
            {
                label: "Harmonized System Code",
                value: post?.hs_code,
            },
        ],
        [post]
    );

    const technicalRows = useMemo(
        () => [
            {
                label: "Estimated Production or Delivery Lead Time",
                value: post?.lead_time,
            },
            {
                label: "Payment Terms and Conditions",
                value: post?.payment_terms,
            },
            {
                label: "Shipping Terms and Conditions",
                value: post?.shipping_terms,
            },
            {
                label: "Product Sample Availability",
                value: formatBooleanLike(post?.sample_available),
            },
            {
                label: "Product Certifications",
                value: post?.certifications,
            },
            {
                label: "Submission Date and Time",
                value: formatDate(post?.created_at),
            },
        ],
        [post]
    );

    if (loading) {
        return (
            <div className="grid min-h-[55vh] place-items-center">
                <div className="text-center">
                    <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-brand-orange" />

                    <p className="mt-3 text-sm font-semibold text-content-secondary">
                        Loading post details...
                    </p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                <AlertCircle className="mx-auto h-9 w-9 text-red-500" />

                <h1 className="mt-3 text-lg font-bold text-red-800">
                    Post not found
                </h1>

                <p className="mt-2 text-sm text-red-600">
                    {error || "The requested post is unavailable."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-3 text-sm font-bold text-white"
                >
                    <ArrowLeft size={16} />
                    Return to Posts
                </button>
            </div>
        );
    }

    const title = post.title || post.name || "Untitled Post";

    const categoryName = getCategoryName(post);

    const brandName = getBrandName(post);

    const stockQuantity = getStockQuantity(post);

    const rating = getRating(post);
    const reviewCount = getReviewCount(post);
    const existingRejectReason = getRejectReason(post);

    const available = post.status === "published" || post.status === "approved";

    return (
        <div className="-m-4 min-h-screen bg-brand-cream p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
            <div className="mx-auto w-full max-w-[1500px]">
                <Breadcrumb
                    category={categoryName}
                    brand={brandName}
                    title={title}
                    onBack={() => navigate(-1)}
                />

                {message && (
                    <div
                        role="status"
                        className="mb-5 flex items-start gap-3 rounded-2xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text"
                    >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <ImageGallery
                        title={title}
                        images={images}
                        currentIndex={currentImageIndex}
                        onChange={setCurrentImageIndex}
                        featured={post.is_featured || post.featured}
                    />

                    <div className="min-w-0 space-y-5">
                        <section className="rounded-[26px] border border-brand-orange/15 bg-theme-surface p-5 shadow-sm sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-xl font-extrabold leading-tight text-content sm:text-2xl">
                                        {title}
                                    </h1>

                                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                                        <Rating
                                            rating={rating}
                                            reviewCount={reviewCount}
                                        />

                                        <span className="hidden h-5 w-px bg-theme-surface-soft sm:block" />

                                        <StatusBadge
                                            status={
                                                available
                                                    ? "available"
                                                    : post.status
                                            }
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFavorite((current) => !current)
                                    }
                                    aria-label={
                                        favorite
                                            ? "Remove from favorites"
                                            : "Add to favorites"
                                    }
                                    className={[
                                        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition",
                                        favorite
                                            ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                                            : "border-line bg-theme-surface text-content-muted hover:border-brand-orange hover:text-brand-orange",
                                    ].join(" ")}
                                >
                                    <Heart
                                        size={20}
                                        className={
                                            favorite ? "fill-current" : ""
                                        }
                                    />
                                </button>
                            </div>
                        </section>

                        <section className="rounded-[26px] border border-brand-orange/15 bg-theme-surface p-5 shadow-sm sm:p-6">
                            <p className="text-4xl font-black tracking-tight text-content">
                                {formatPrice(post)}
                            </p>

                            {colorOptions.length > 0 && (
                                <div className="mt-6">
                                    <p className="mb-3 text-sm font-semibold text-content">
                                        Color
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {colorOptions.map((color) => {
                                            const active =
                                                selectedColor === color.id;

                                            return (
                                                <button
                                                    key={color.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            color.id
                                                        )
                                                    }
                                                    title={color.name}
                                                    aria-label={`Select ${color.name}`}
                                                    className={[
                                                        "grid h-11 w-11 place-items-center rounded-full border-2 bg-theme-surface p-1 transition",
                                                        active
                                                            ? "border-brand-orange"
                                                            : "border-line hover:border-brand-orange/40",
                                                    ].join(" ")}
                                                >
                                                    <span
                                                        className="grid h-full w-full place-items-center rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                color.value,
                                                        }}
                                                    >
                                                        {active && (
                                                            <CheckCircle2
                                                                size={18}
                                                                className="text-white drop-shadow"
                                                            />
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-between rounded-xl bg-theme-page px-4 py-3 text-sm">
                                <span className="font-medium text-content-muted">
                                    Stock
                                </span>

                                <span
                                    className={[
                                        "font-bold",
                                        stockQuantity > 0
                                            ? "text-theme-success-text"
                                            : "text-red-600",
                                    ].join(" ")}
                                >
                                    {stockQuantity}
                                </span>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
                                <QuantitySelector
                                    quantity={quantity}
                                    onChange={setQuantity}
                                />

                                {canReviewPost ? (
                                    <button
                                        type="button"
                                        disabled={updating}
                                        onClick={() =>
                                            updatePostStatus("published")
                                        }
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updating ? (
                                            <LoaderCircle
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <BadgeCheck size={18} />
                                        )}
                                        Publish Post
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-theme-surface-soft px-5 text-sm font-bold capitalize text-content-secondary"
                                    >
                                        <ShieldCheck size={18} />
                                        {post.status || "Reviewed"}
                                    </button>
                                )}
                            </div>

                            {canReviewPost && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("reviews")}
                                    className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-orange/25 bg-theme-surface text-sm font-semibold text-brand-orange transition hover:bg-brand-orange/10"
                                >
                                    <XCircle size={17} />
                                    Review or Reject Post
                                </button>
                            )}

                            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-content-secondary">Listed by:</span>

                                <Store size={17} className="text-brand-orange" />

                                <span className="font-bold text-brand-orange">
                                    {getOwnerName(post)}
                                </span>
                            </div>

                            <div className="mt-6">
                                <p className="mb-3 text-sm font-semibold text-content-secondary">
                                    Share
                                </p>

                                <div className="flex items-center gap-2">
                                    <ShareButton label="Share on Facebook">
                                        <span className="text-sm font-black">
                                            f
                                        </span>
                                    </ShareButton>

                                    <ShareButton
                                        label="Share product"
                                        icon={Send}
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title,
                                                    url: window.location.href,
                                                });
                                            } else {
                                                copyCurrentUrl();
                                            }
                                        }}
                                    />

                                    <ShareButton
                                        label="Copy product link"
                                        icon={Link2}
                                        onClick={copyCurrentUrl}
                                    />

                                    <ShareButton
                                        label="Share by message"
                                        icon={MessageCircle}
                                        onClick={copyCurrentUrl}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[22px] border border-brand-orange/15 bg-theme-surface p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                                    <FileText size={20} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <h2 className="font-bold text-content">
                                        Policies & Agreements
                                    </h2>

                                    <p className="mt-1 text-xs text-content-muted">
                                        Product review policy, publishing rules,
                                        and marketplace terms
                                    </p>
                                </div>

                                <ChevronRight
                                    size={21}
                                    className="text-brand-orange"
                                />
                            </div>
                        </section>
                    </div>
                </div>

                <section className="mt-7 rounded-[26px] border border-brand-orange/15 bg-theme-surface p-4 shadow-sm sm:p-7">
                    <div className="flex flex-wrap gap-2">
                        {TAB_ITEMS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={[
                                    "rounded-full border px-5 py-2.5 text-sm font-medium transition",
                                    activeTab === tab.key
                                        ? "border-brand-orange bg-brand-orange text-white"
                                        : "border-line bg-theme-surface text-content-secondary hover:border-brand-orange/40 hover:text-brand-orange",
                                ].join(" ")}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="px-1 pb-2 pt-8 sm:px-3">
                        {activeTab === "description" && (
                            <div>
                                <h2 className="text-lg font-extrabold text-content">
                                    Product Description
                                </h2>

                                <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-content-secondary">
                                    {getPostContent(post) ||
                                        "No product description was provided."}
                                </div>
                            </div>
                        )}

                        {activeTab === "specifications" && (
                            <div>
                                <h2 className="mb-5 text-lg font-extrabold text-content">
                                    Product Specifications
                                </h2>

                                <DetailTable rows={specificationRows} />
                            </div>
                        )}

                        {activeTab === "technical" && (
                            <div>
                                <h2 className="mb-5 text-lg font-extrabold text-content">
                                    Technical and Commercial Details
                                </h2>

                                <DetailTable rows={technicalRows} />
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                                <div className="rounded-2xl bg-brand-orange/10/60 p-5">
                                    <h2 className="text-lg font-extrabold text-content">
                                        Submission Review
                                    </h2>

                                    <div className="mt-5 space-y-4 text-sm">
                                        <div className="flex items-center gap-3">
                                            <User
                                                size={17}
                                                className="text-brand-orange"
                                            />

                                            <div>
                                                <p className="font-semibold text-content">
                                                    {getOwnerName(post)}
                                                </p>

                                                <p className="text-content-muted">
                                                    {getOwnerEmail(post)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Clock
                                                size={17}
                                                className="text-brand-orange"
                                            />

                                            <p className="text-content-secondary">
                                                {formatDate(post.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <BadgeCheck
                                                size={17}
                                                className="text-brand-orange"
                                            />

                                            <StatusBadge status={post.status} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-extrabold text-content">
                                        Administrator Note
                                    </h2>

                                    <textarea
                                        value={rejectReason}
                                        onChange={(event) =>
                                            setRejectReason(event.target.value)
                                        }
                                        disabled={!canReviewPost || updating}
                                        rows={7}
                                        placeholder="Write a clear reason before rejecting this post."
                                        className="mt-4 w-full resize-y rounded-2xl border border-line bg-theme-surface px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 disabled:bg-theme-page disabled:text-content-muted"
                                    />

                                    {!canReviewPost && existingRejectReason && (
                                        <p className="mt-2 text-xs text-content-muted">
                                            This note was saved during the
                                            previous review.
                                        </p>
                                    )}

                                    {canReviewPost && (
                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                disabled={updating}
                                                onClick={() =>
                                                    updatePostStatus("rejected")
                                                }
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-orange bg-theme-surface px-5 text-sm font-bold text-brand-orange transition hover:bg-brand-orange/10 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updating ? (
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <XCircle size={17} />
                                                )}
                                                Reject Post
                                            </button>

                                            <button
                                                type="button"
                                                disabled={updating}
                                                onClick={() =>
                                                    updatePostStatus(
                                                        "published"
                                                    )
                                                }
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updating ? (
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <CheckCircle2 size={17} />
                                                )}
                                                Publish Post
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PostDetails;
