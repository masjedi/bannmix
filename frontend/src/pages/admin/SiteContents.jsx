import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    FilterX,
    Image as ImageIcon,
    Languages,
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";

import siteContentApi from "../../api/siteContentApi";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const LANGUAGE_OPTIONS = [
    {
        code: "en",
        label: "English",
        direction: "ltr",
    },
    {
        code: "ps",
        label: "پښتو",
        direction: "rtl",
    },
    {
        code: "fa",
        label: "دری",
        direction: "rtl",
    },
];

const PAGE_OPTIONS = [
    {
        value: "home",
        label: "Home",
    },
    {
        value: "products",
        label: "Products",
    },
    {
        value: "about",
        label: "About Us",
    },
    {
        value: "quality_standards",
        label: "Quality & Standards",
    },
    {
        value: "research_knowledge",
        label: "Research & Knowledge",
    },
    {
        value: "news_media",
        label: "News & Media",
    },
    {
        value: "online_store",
        label: "Online Store",
    },
    {
        value: "partners_distributors",
        label: "Partners & Distributors",
    },
    {
        value: "contact",
        label: "Contact Us",
    },
    {
        value: "faq",
        label: "FAQ",
    },
];

const getPageLabel = (pageValue) => {
    return (
        PAGE_OPTIONS.find((page) => page.value === pageValue)?.label ||
        pageValue ||
        "Unknown page"
    );
};

const createTranslations = () => ({
    en: "",
    ps: "",
    fa: "",
});

const createEmptyForm = () => ({
    page: "home",
    section: "",
    content_key: "",

    title: createTranslations(),
    subtitle: createTranslations(),
    content: createTranslations(),
    button_text: createTranslations(),

    button_url: "",
    video_url: "",
    metadata: "{}",

    sort_order: 0,
    is_active: true,

    image: null,
    image_path: "",
    image_url: "",
    remove_image: false,
});

const extractListResponse = (response) => {
    const levels = [];
    let current = response;

    // Support Axios responses, already-unwrapped payloads, Laravel paginator
    // payloads, and APIs that expose the list as `items`.
    for (let depth = 0; depth < 5 && current != null; depth += 1) {
        if (Array.isArray(current)) {
            levels.push(current);
            break;
        }

        if (typeof current !== "object") {
            break;
        }

        levels.push(current);

        if (Array.isArray(current.items)) {
            levels.push(current.items);
            break;
        }

        if (!("data" in current)) {
            break;
        }

        current = current.data;
    }

    const records = levels.find(Array.isArray) ?? [];
    const paginationKeys = [
        "current_page",
        "last_page",
        "per_page",
        "total",
        "from",
        "to",
    ];
    const meta = {};

    levels.forEach((level) => {
        if (!level || typeof level !== "object" || Array.isArray(level)) {
            return;
        }

        paginationKeys.forEach((key) => {
            if (level[key] !== undefined && meta[key] === undefined) {
                meta[key] = level[key];
            }
        });

        if (level.meta && typeof level.meta === "object") {
            paginationKeys.forEach((key) => {
                if (level.meta[key] !== undefined && meta[key] === undefined) {
                    meta[key] = level.meta[key];
                }
            });
        }
    });

    return { records, meta };
};

const getErrorMessage = (error) => {
    const validationErrors = error?.response?.data?.errors;

    if (validationErrors && typeof validationErrors === "object") {
        return Object.values(validationErrors).flat().filter(Boolean).join(" ");
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again."
    );
};

const getDisplayTitle = (content) => {
    return (
        content?.title?.en ||
        content?.title?.ps ||
        content?.title?.fa ||
        content?.content_key ||
        "Untitled content"
    );
};

const hasLanguageContent = (content, languageCode) => {
    const fields = [
        content?.title,
        content?.subtitle,
        content?.content,
        content?.button_text,
    ];

    return fields.some((field) => {
        const value = field?.[languageCode];

        return typeof value === "string" && value.trim() !== "";
    });
};

const normalizeTranslations = (value) => ({
    en: value?.en ?? "",
    ps: value?.ps ?? "",
    fa: value?.fa ?? "",
});

const SiteContents = () => {
    const imageObjectUrlRef = useRef(null);

    const [contents, setContents] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 25,
        total: 0,
        from: null,
        to: null,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [actionId, setActionId] = useState(null);
    const [actionType, setActionType] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [pageNumber, setPageNumber] = useState(1);
    const [perPage, setPerPage] = useState(25);

    const [filters, setFilters] = useState({
        search: "",
        page: "",
        section: "",
        is_active: "",
    });

    const [appliedFilters, setAppliedFilters] = useState({
        search: "",
        page: "",
        section: "",
        is_active: "",
    });

    const [formModalOpen, setFormModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedContent, setSelectedContent] = useState(null);

    const [form, setForm] = useState(createEmptyForm);

    const [activeLanguage, setActiveLanguage] = useState("en");

    const [formError, setFormError] = useState("");

    const [imagePreview, setImagePreview] = useState("");

    const releaseImageObjectUrl = useCallback(() => {
        if (imageObjectUrlRef.current) {
            URL.revokeObjectURL(imageObjectUrlRef.current);

            imageObjectUrlRef.current = null;
        }
    }, []);

    const loadContents = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page: pageNumber,
                per_page: perPage,
            };

            if (appliedFilters.search.trim()) {
                params.search = appliedFilters.search.trim();
            }

            if (appliedFilters.page.trim()) {
                params.content_page = appliedFilters.page.trim();
            }

            if (appliedFilters.section.trim()) {
                params.section = appliedFilters.section.trim();
            }

            if (appliedFilters.is_active !== "") {
                params.is_active = appliedFilters.is_active;
            }

            const response = await siteContentApi.getContents(params);

            const normalized = extractListResponse(response);

            setContents(normalized.records);

            setMeta((current) => ({
                ...current,
                ...normalized.meta,
                current_page: normalized.meta?.current_page ?? pageNumber,
                last_page: normalized.meta?.last_page ?? 1,
                total: normalized.meta?.total ?? normalized.records.length,
            }));
        } catch (requestError) {
            setError(getErrorMessage(requestError));

            setContents([]);
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, pageNumber, perPage]);

    useEffect(() => {
        loadContents();
    }, [loadContents]);

    useEffect(() => {
        return () => {
            releaseImageObjectUrl();
        };
    }, [releaseImageObjectUrl]);

    const clearMessages = () => {
        setError("");
        setSuccess("");
        setFormError("");
    };

    const resetForm = () => {
        releaseImageObjectUrl();

        setSelectedContent(null);
        setForm(createEmptyForm());
        setActiveLanguage("en");
        setFormError("");
        setImagePreview("");
    };

    const openCreateModal = () => {
        clearMessages();
        resetForm();
        setFormModalOpen(true);
    };

    const openEditModal = (content) => {
        clearMessages();
        releaseImageObjectUrl();

        setSelectedContent(content);

        setForm({
            page: content.page ?? "home",
            section: content.section ?? "",
            content_key: content.content_key ?? "",

            title: normalizeTranslations(content.title),

            subtitle: normalizeTranslations(content.subtitle),

            content: normalizeTranslations(content.content),

            button_text: normalizeTranslations(content.button_text),

            button_url: content.button_url ?? "",

            video_url: content.video_url ?? "",

            metadata: JSON.stringify(content.metadata ?? {}, null, 2),

            sort_order: Number(content.sort_order) || 0,

            is_active: Boolean(content.is_active),

            image: null,

            image_path: content.image_path ?? "",

            image_url: content.image_url ?? "",

            remove_image: false,
        });

        setImagePreview(content.image_url ?? "");

        setActiveLanguage("en");
        setFormError("");
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (saving) {
            return;
        }

        setFormModalOpen(false);
        resetForm();
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();

        setPageNumber(1);

        setAppliedFilters({
            ...filters,
        });
    };

    const clearFilters = () => {
        const emptyFilters = {
            search: "",
            page: "",
            section: "",
            is_active: "",
        };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPageNumber(1);
    };

    const handleBasicFieldChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleTranslationChange = (field, language, value) => {
        setForm((current) => ({
            ...current,
            [field]: {
                ...current[field],
                [language]: value,
            },
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] ?? null;

        releaseImageObjectUrl();

        if (!file) {
            setForm((current) => ({
                ...current,
                image: null,
            }));

            setImagePreview(form.remove_image ? "" : form.image_url);

            return;
        }

        const objectUrl = URL.createObjectURL(file);

        imageObjectUrlRef.current = objectUrl;

        setForm((current) => ({
            ...current,
            image: file,
            remove_image: false,
        }));

        setImagePreview(objectUrl);
    };

    const removeSelectedImage = () => {
        releaseImageObjectUrl();

        setForm((current) => ({
            ...current,
            image: null,
            remove_image: true,
        }));

        setImagePreview("");
    };

    const restoreExistingImage = () => {
        releaseImageObjectUrl();

        setForm((current) => ({
            ...current,
            image: null,
            remove_image: false,
        }));

        setImagePreview(form.image_url);
    };

    const validateForm = () => {
        if (!form.page.trim()) {
            return "Page is required.";
        }

        if (!form.section.trim()) {
            return "Section is required.";
        }

        const hasTranslatedContent = [
            form.title,
            form.subtitle,
            form.content,
            form.button_text,
        ].some((translations) =>
            Object.values(translations).some(
                (value) => typeof value === "string" && value.trim() !== ""
            )
        );

        const hasMedia =
            Boolean(form.image) ||
            Boolean(form.image_path) ||
            Boolean(form.video_url.trim());

        if (!selectedContent && !hasTranslatedContent && !hasMedia) {
            return "Enter at least one title, subtitle, content, button text, image, or video.";
        }

        try {
            const metadata = form.metadata.trim();

            if (metadata) {
                const parsedMetadata = JSON.parse(metadata);

                if (
                    Array.isArray(parsedMetadata) ||
                    typeof parsedMetadata !== "object" ||
                    parsedMetadata === null
                ) {
                    return "Metadata must be a valid JSON object.";
                }
            }
        } catch {
            return "Metadata contains invalid JSON.";
        }

        return "";
    };

    const buildPayload = () => {
        const payload = new FormData();

        const appendTranslations = (field, translations) => {
            const hasValue = Object.values(translations).some(
                (value) => typeof value === "string" && value.trim() !== ""
            );

            if (hasValue) {
                payload.append(field, JSON.stringify(translations));
            } else if (selectedContent) {
                // An explicit null clears an existing translation group on
                // edit without triggering the backend's empty-array rule.
                payload.append(field, "null");
            }
        };

        payload.append("page", form.page.trim());

        payload.append("section", form.section.trim());

        payload.append("content_key", form.content_key.trim());

        appendTranslations("title", form.title);

        appendTranslations("subtitle", form.subtitle);

        appendTranslations("content", form.content);

        appendTranslations("button_text", form.button_text);

        payload.append("button_url", form.button_url.trim());

        payload.append("video_url", form.video_url.trim());

        payload.append("sort_order", String(Number(form.sort_order) || 0));

        payload.append("is_active", form.is_active ? "1" : "0");

        payload.append("remove_image", form.remove_image ? "1" : "0");

        const metadata = form.metadata.trim();

        payload.append("metadata", metadata || "{}");

        if (form.image) {
            payload.append("image", form.image);
        }

        return payload;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationMessage = validateForm();

        if (validationMessage) {
            setFormError(validationMessage);
            return;
        }

        setSaving(true);
        setFormError("");
        setError("");
        setSuccess("");

        try {
            const payload = buildPayload();

            if (selectedContent) {
                await siteContentApi.updateContent(selectedContent.id, payload);

                setSuccess("Website content updated successfully.");
            } else {
                await siteContentApi.createContent(payload);

                setSuccess("Website content created successfully.");
            }

            setFormModalOpen(false);
            resetForm();

            await loadContents();
        } catch (requestError) {
            setFormError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (content) => {
        setActionId(content.id);
        setActionType("status");
        setError("");
        setSuccess("");

        try {
            const nextStatus = !content.is_active;

            await siteContentApi.updateContentStatus(content.id, nextStatus);

            setSuccess(
                nextStatus
                    ? "Content activated successfully."
                    : "Content deactivated successfully."
            );

            setContents((current) =>
                current.map((item) =>
                    item.id === content.id
                        ? {
                              ...item,
                              is_active: nextStatus,
                          }
                        : item
                )
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setActionId(null);
            setActionType("");
        }
    };

    const openDeleteModal = (content) => {
        clearMessages();
        setSelectedContent(content);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (actionType === "delete" && actionId) {
            return;
        }

        setDeleteModalOpen(false);
        setSelectedContent(null);
    };

    const confirmDelete = async () => {
        if (!selectedContent) {
            return;
        }

        setActionId(selectedContent.id);
        setActionType("delete");
        setError("");
        setSuccess("");

        try {
            await siteContentApi.deleteContent(selectedContent.id);

            setDeleteModalOpen(false);
            setSelectedContent(null);

            setSuccess("Website content deleted successfully.");

            if (contents.length === 1 && pageNumber > 1) {
                setPageNumber((current) => current - 1);
            } else {
                await loadContents();
            }
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setActionId(null);
            setActionType("");
        }
    };

    const contentColumns = useMemo(
        () => [
            {
                header: "Content",
                accessor: "content_key",
                render: (content) => (
                    <div className="max-w-sm">
                        <p className="truncate font-semibold text-content">
                            {getDisplayTitle(content)}
                        </p>

                        <p className="mt-1 truncate text-xs text-content-muted">
                            {content.content_key || "No content key"}
                        </p>
                    </div>
                ),
            },
            {
                header: "Location",
                accessor: "page",
                render: (content) => (
                    <div className="space-y-1">
                        <div>
                            <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                {getPageLabel(content.page)}
                            </span>

                            <p className="mt-1 text-[10px] text-content-muted">
                                {content.page}
                            </p>
                        </div>

                        <p className="text-xs text-content-muted">
                            Section: {content.section}
                        </p>
                    </div>
                ),
            },
            {
                header: "Languages",
                key: "languages",
                sortable: false,
                searchable: false,
                render: (content) => (
                    <div className="flex flex-wrap gap-1.5">
                        {LANGUAGE_OPTIONS.map((language) => {
                            const available = hasLanguageContent(
                                content,
                                language.code
                            );

                            return (
                                <span
                                    key={language.code}
                                    className={[
                                        "rounded-md px-2 py-1 text-[10px] font-bold uppercase",
                                        available
                                            ? "bg-theme-success-bg text-theme-success-text"
                                            : "bg-theme-surface-soft text-content-muted",
                                    ].join(" ")}
                                >
                                    {language.code}
                                </span>
                            );
                        })}
                    </div>
                ),
            },
            {
                header: "Media",
                key: "media",
                sortable: false,
                searchable: false,
                render: (content) =>
                    content.image_url ? (
                        <img
                            src={content.image_url}
                            alt=""
                            className="h-11 w-16 rounded-lg border border-line object-cover"
                        />
                    ) : content.video_url ? (
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700">
                            Video
                        </span>
                    ) : (
                        <span className="text-xs text-content-muted">No media</span>
                    ),
            },
            {
                header: "Order",
                accessor: "sort_order",
                align: "center",
                render: (content) => (
                    <span className="font-semibold text-content-secondary">
                        {content.sort_order ?? 0}
                    </span>
                ),
            },
            {
                header: "Status",
                accessor: "is_active",
                render: (content) => (
                    <button
                        type="button"
                        onClick={() => handleStatusChange(content)}
                        disabled={
                            actionId === content.id && actionType === "status"
                        }
                        className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                            content.is_active
                                ? "bg-theme-success-bg text-theme-success-text hover:bg-theme-success-bg"
                                : "bg-theme-surface-soft text-content-secondary hover:bg-theme-surface-soft",
                        ].join(" ")}
                    >
                        {actionId === content.id && actionType === "status" ? (
                            <LoaderCircle size={13} className="animate-spin" />
                        ) : content.is_active ? (
                            <Eye size={13} />
                        ) : (
                            <EyeOff size={13} />
                        )}

                        {content.is_active ? "Active" : "Inactive"}
                    </button>
                ),
            },
        ],
        [actionId, actionType]
    );

    return (
        <section className="space-y-6">
            {/* Page header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                        <Languages size={14} />
                        Multilingual CMS
                    </div>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-content">
                        Website Content
                    </h1>

                    <p className="mt-1 text-sm text-content-muted">
                        Manage English, Pashto, and Dari content for the public
                        website.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-semibold text-white shadow-sm shadow-brand-orange/20 transition hover:bg-brand-orange/90"
                >
                    <Plus size={17} />
                    Add Content
                </button>
            </div>

            {/* Alerts */}

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />

                    <p className="flex-1">{error}</p>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Close error"
                        className="rounded p-0.5 hover:bg-red-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text"
                >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                    <p className="flex-1">{success}</p>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Close success message"
                        className="rounded p-0.5 hover:bg-theme-success-bg"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Filters */}

            <form
                onSubmit={applyFilters}
                className="rounded-2xl border border-line bg-theme-surface p-4 shadow-sm"
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_180px_160px_auto]">
                    <label className="relative">
                        <span className="sr-only">Search content</span>

                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                        />

                        <input
                            type="search"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search title, key, page…"
                            className="h-10 w-full rounded-lg border border-line bg-theme-page pl-9 pr-3 text-sm outline-none transition focus:border-brand-orange focus:bg-theme-surface focus:ring-2 focus:ring-brand-orange/20"
                        />
                    </label>

                    <select
                        name="page"
                        value={filters.page}
                        onChange={handleFilterChange}
                        className="h-10 rounded-lg border border-line bg-theme-page px-3 text-sm text-content-secondary outline-none transition focus:border-brand-orange focus:bg-theme-surface focus:ring-2 focus:ring-brand-orange/20"
                    >
                        <option value="">All pages</option>

                        {PAGE_OPTIONS.map((page) => (
                            <option key={page.value} value={page.value}>
                                {page.label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="section"
                        value={filters.section}
                        onChange={handleFilterChange}
                        placeholder="Filter section"
                        className="h-10 rounded-lg border border-line bg-theme-page px-3 text-sm outline-none transition focus:border-brand-orange focus:bg-theme-surface focus:ring-2 focus:ring-brand-orange/20"
                    />

                    <select
                        name="is_active"
                        value={filters.is_active}
                        onChange={handleFilterChange}
                        className="h-10 rounded-lg border border-line bg-theme-page px-3 text-sm outline-none transition focus:border-brand-orange focus:bg-theme-surface focus:ring-2 focus:ring-brand-orange/20"
                    >
                        <option value="">All statuses</option>

                        <option value="1">Active</option>

                        <option value="0">Inactive</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-theme-page px-4 text-sm font-semibold text-white transition hover:bg-theme-surface-elevated"
                        >
                            <Search size={16} />
                            Apply
                        </button>

                        <button
                            type="button"
                            onClick={clearFilters}
                            title="Clear filters"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-content-secondary transition hover:border-brand-orange hover:text-brand-orange"
                        >
                            <FilterX size={17} />
                        </button>
                    </div>
                </div>
            </form>

            {/* Content table */}

            <DataTable
                title="Content Records"
                subtitle={`${meta.total || 0} total records`}
                columns={contentColumns}
                data={contents}
                loading={loading}
                rowKey="id"
                searchable={false}
                onRefresh={loadContents}
                refreshLoading={loading}
                exportable
                printable
                emptyText="No website content found."
                showIndex
                pagination
                paginationMeta={meta}
                onPageChange={setPageNumber}
                onPageSizeChange={(nextPageSize) => {
                    setPageNumber(1);
                    setPerPage(nextPageSize);
                }}
                actions={(content) => (
                    <>
                        <button
                            type="button"
                            onClick={() => openEditModal(content)}
                            title="Edit content"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-content-secondary transition hover:border-brand-orange hover:bg-brand-orange/5 hover:text-brand-orange"
                        >
                            <Pencil size={15} />
                        </button>

                        <button
                            type="button"
                            onClick={() => openDeleteModal(content)}
                            title="Delete content"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2 size={15} />
                        </button>
                    </>
                )}
            />

            {/* Create and edit modal */}

            <Modal
                open={formModalOpen}
                title={
                    selectedContent
                        ? "Edit Website Content"
                        : "Add Website Content"
                }
                onClose={closeFormModal}
                size="xl"
                closeDisabled={saving}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                            <p>{formError}</p>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Page *</span>

                            <select
                                name="page"
                                value={form.page}
                                onChange={handleBasicFieldChange}
                                required
                                className="h-10 w-full rounded-lg border border-line bg-theme-surface px-3 text-content-secondary outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            >
                                {form.page &&
                                    !PAGE_OPTIONS.some(
                                        (page) => page.value === form.page
                                    ) && (
                                        <option value={form.page}>
                                            {getPageLabel(form.page)}
                                        </option>
                                    )}

                                {PAGE_OPTIONS.map((page) => (
                                    <option key={page.value} value={page.value}>
                                        {page.label}
                                    </option>
                                ))}
                            </select>

                            <span className="block text-xs font-normal text-content-muted">
                                Select the public website page where this
                                content will appear.
                            </span>
                        </label>

                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Section *</span>
                            <input
                                type="text"
                                name="section"
                                value={form.section}
                                onChange={handleBasicFieldChange}
                                required
                                placeholder="hero"
                                className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>

                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Content key</span>
                            <input
                                type="text"
                                name="content_key"
                                value={form.content_key}
                                onChange={handleBasicFieldChange}
                                placeholder="main_banner"
                                className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-line">
                        <div className="flex flex-wrap gap-1 border-b border-line bg-theme-page p-2">
                            {LANGUAGE_OPTIONS.map((language) => (
                                <button
                                    key={language.code}
                                    type="button"
                                    onClick={() =>
                                        setActiveLanguage(language.code)
                                    }
                                    className={[
                                        "rounded-lg px-4 py-2 text-sm font-semibold transition",
                                        activeLanguage === language.code
                                            ? "bg-theme-surface text-brand-orange shadow-sm"
                                            : "text-content-muted hover:text-content",
                                    ].join(" ")}
                                >
                                    {language.label}
                                </button>
                            ))}
                        </div>

                        <div
                            className="grid gap-4 p-5 md:grid-cols-2"
                            dir={
                                LANGUAGE_OPTIONS.find(
                                    (language) =>
                                        language.code === activeLanguage
                                )?.direction
                            }
                        >
                            <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                                <span>Title</span>
                                <input
                                    type="text"
                                    value={form.title[activeLanguage]}
                                    onChange={(event) =>
                                        handleTranslationChange(
                                            "title",
                                            activeLanguage,
                                            event.target.value
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                                <span>Subtitle</span>
                                <input
                                    type="text"
                                    value={form.subtitle[activeLanguage]}
                                    onChange={(event) =>
                                        handleTranslationChange(
                                            "subtitle",
                                            activeLanguage,
                                            event.target.value
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-content-secondary md:col-span-2">
                                <span>Content</span>
                                <textarea
                                    rows={6}
                                    value={form.content[activeLanguage]}
                                    onChange={(event) =>
                                        handleTranslationChange(
                                            "content",
                                            activeLanguage,
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-line px-3 py-2 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </label>

                            <label className="space-y-1.5 text-sm font-medium text-content-secondary md:col-span-2">
                                <span>Button text</span>
                                <input
                                    type="text"
                                    value={form.button_text[activeLanguage]}
                                    onChange={(event) =>
                                        handleTranslationChange(
                                            "button_text",
                                            activeLanguage,
                                            event.target.value
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Button URL</span>
                            <input
                                type="text"
                                name="button_url"
                                value={form.button_url}
                                onChange={handleBasicFieldChange}
                                placeholder="https://example.com or /products"
                                className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>

                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Video URL</span>
                            <input
                                type="text"
                                name="video_url"
                                value={form.video_url}
                                onChange={handleBasicFieldChange}
                                placeholder="https://..."
                                className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>

                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Sort order</span>
                            <input
                                type="number"
                                min="0"
                                name="sort_order"
                                value={form.sort_order}
                                onChange={handleBasicFieldChange}
                                className="h-10 w-full rounded-lg border border-line px-3 outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </label>

                        <label className="flex items-center gap-3 self-end rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-content-secondary">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleBasicFieldChange}
                                className="h-4 w-4 rounded border-line-strong text-brand-orange focus:ring-brand-orange"
                            />
                            Active on the public website
                        </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-content-secondary">
                                Image
                            </label>
                            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-theme-page px-4 text-center transition hover:border-brand-orange hover:bg-brand-orange/5">
                                <ImageIcon
                                    size={24}
                                    className="text-content-muted"
                                />
                                <span className="mt-2 text-sm font-semibold text-content-secondary">
                                    Choose an image
                                </span>
                                <span className="mt-1 text-xs text-content-muted">
                                    JPG, JPEG, PNG, WebP or AVIF, up to 5 MB
                                </span>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                                    onChange={handleImageChange}
                                    className="sr-only"
                                />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-content-secondary">
                                Image preview
                            </p>
                            {imagePreview ? (
                                <div className="relative overflow-hidden rounded-xl border border-line bg-theme-page">
                                    <img
                                        src={imagePreview}
                                        alt="Selected content preview"
                                        className="h-32 w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeSelectedImage}
                                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-theme-surface/90 text-red-600 shadow"
                                        aria-label="Remove image"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ) : form.image_url && form.remove_image ? (
                                <button
                                    type="button"
                                    onClick={restoreExistingImage}
                                    className="h-32 w-full rounded-xl border border-dashed border-line-strong text-sm font-semibold text-content-secondary hover:border-brand-orange hover:text-brand-orange"
                                >
                                    Restore existing image
                                </button>
                            ) : (
                                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line text-sm text-content-muted">
                                    No image selected
                                </div>
                            )}
                        </div>
                    </div>

                    <label className="block space-y-1.5 text-sm font-medium text-content-secondary">
                        <span>Metadata (JSON object)</span>
                        <textarea
                            name="metadata"
                            rows={5}
                            value={form.metadata}
                            onChange={handleBasicFieldChange}
                            spellCheck="false"
                            className="w-full rounded-lg border border-line px-3 py-2 font-mono text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                        />
                    </label>

                    <div className="flex justify-end gap-3 border-t border-line pt-5">
                        <button
                            type="button"
                            onClick={closeFormModal}
                            disabled={saving}
                            className="h-10 rounded-lg border border-line px-4 text-sm font-semibold text-content-secondary transition hover:bg-theme-page disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />
                            )}
                            {selectedContent ? "Save Changes" : "Add Content"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirmation modal */}

            <Modal
                open={deleteModalOpen}
                title="Delete Website Content"
                onClose={closeDeleteModal}
                size="sm"
                closeDisabled={actionType === "delete"}
            >
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-content-secondary">
                        Delete{" "}
                        <strong>{getDisplayTitle(selectedContent)}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            disabled={actionType === "delete"}
                            className="h-10 rounded-lg border border-line px-4 text-sm font-semibold text-content-secondary disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={actionType === "delete"}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {actionType === "delete" && (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                />
                            )}
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default SiteContents;
