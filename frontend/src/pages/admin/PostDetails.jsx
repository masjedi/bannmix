import { useEffect, useMemo, useState } from "react";

import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    LoaderCircle,
    Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { postsApi } from "../../api/postsApi";
import AdminProductReviewsPanel from "../../components/admin/products/AdminProductReviewsPanel";
import ProductForm from "../../components/admin/products/ProductForm";
import { useAdminBreadcrumbItems } from "../../components/layouts/admin/AdminBreadcrumbContext";

const PostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const breadcrumbItems = useMemo(() => {
        if (!post) return null;
        return [
            { label: "Home", to: "/admin" },
            { label: "Products", to: "/admin/posts" },
            { label: post.title || "Product", to: null },
        ];
    }, [post]);

    useAdminBreadcrumbItems(breadcrumbItems);

    const loadPost = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await postsApi.getPost(id);
            setPost(response?.data || response);
        } catch (requestError) {
            setPost(null);
            setError(
                requestError?.response?.data?.message ||
                    "The requested product could not be found."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPost();
    }, [id]);

    const handleSave = async (payload) => {
        if (!post) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await postsApi.updatePost(post.id, payload);
            const updated = response?.data || response;
            setPost((current) => ({ ...current, ...updated }));
            setMessage("Product saved.");
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not save the product."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!post) return;
        if (!window.confirm(`Delete “${post.title || "this product"}”?`)) {
            return;
        }

        try {
            await postsApi.deletePost(post.id);
            navigate("/admin/posts");
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message ||
                    "Could not delete the product."
            );
        }
    };

    if (loading) {
        return (
            <div className="grid min-h-[40vh] place-items-center">
                <div className="text-center">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand-orange" />
                    <p className="mt-3 text-sm font-medium text-content-muted">
                        Loading product…
                    </p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <section className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                <h1 className="mt-3 text-lg font-bold text-red-800">
                    Product not found
                </h1>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <Link
                    to="/admin/posts"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <ArrowLeft size={16} />
                    Back to Products
                </Link>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Link
                        to="/admin/posts"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted transition hover:text-brand-orange"
                    >
                        <ArrowLeft size={15} />
                        Back to Products
                    </Link>
                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-content">
                        {post.title || "Untitled Product"}
                    </h1>
                    <p className="mt-1 text-sm text-content-muted">
                        Edit the product details shown on the public catalog.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    <Trash2 size={15} />
                    Delete
                </button>
            </div>

            {message ? (
                <div className="flex items-start gap-3 rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    {message}
                </div>
            ) : null}

            <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm sm:p-6">
                <ProductForm
                    product={post}
                    saving={saving}
                    error={error}
                    submitLabel="Save changes"
                    onSubmit={handleSave}
                />
            </div>

            <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-content">
                    Customer reviews
                </h2>
                <p className="mt-1 text-sm text-content-muted">
                    Moderate reviews submitted from the public product page.
                </p>
                <div className="mt-5">
                    <AdminProductReviewsPanel
                        postId={post.id}
                        onUpdated={loadPost}
                    />
                </div>
            </div>
        </section>
    );
};

export default PostDetails;
