import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    FilterX,
    Languages,
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";

import siteContentApi from "../../api/siteContentApi";
import SectionContentEditor from "../../components/admin/siteContent/SectionContentEditor";
import SiteContentSectionForm from "../../components/admin/siteContent/SiteContentSectionForm";
import WebsitePageEditor from "../../components/admin/siteContent/WebsitePageEditor";
import {
    getPageLabel,
    getPageSections,
    getWebsitePageDefaultSection,
    isWebsitePageSlug,
    LANGUAGE_OPTIONS,
    PAGE_LABELS,
    resolveFormSchema,
} from "../../components/admin/siteContent/siteContentFormSchemas";
import {
    buildSectionPayload,
    createEmptyForm,
    countRecordMedia,
    extractListResponse,
    formFromContent,
    getDisplayTitle,
    getErrorMessage,
    hasLanguageContent,
    validateSectionForm,
} from "../../components/admin/siteContent/siteContentFormUtils";
import useSiteContentImageForm from "../../components/admin/siteContent/useSiteContentImageForm";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const PAGE_OPTIONS = Object.entries(PAGE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const SiteContents = () => {
    const [searchParams, setSearchParams] = useSearchParams();

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

    const formSchema = useMemo(
        () => resolveFormSchema(form.page, form.section),
        [form.page, form.section]
    );

    const isWebsitePageEditorView =
        Boolean(appliedFilters.page) &&
        Boolean(appliedFilters.section) &&
        isWebsitePageSlug(appliedFilters.page);

    const isHomeSectionEditorView =
        appliedFilters.page === "home" && Boolean(appliedFilters.section);

    const isFocusedPageView = isWebsitePageEditorView || isHomeSectionEditorView;

    const {
        handleImageChange,
        removeSelectedImage,
        restoreExistingImage,
        handleAddImages,
        handleRemoveExistingImage,
        handleRemoveNewImage,
        releaseAllImagePreviews,
        imagePreview,
        visibleExistingImages,
    } = useSiteContentImageForm({ form, setForm });

    useEffect(() => {
        const nextFilters = {
            search: searchParams.get("search") || "",
            page: searchParams.get("page") || "",
            section: searchParams.get("section") || "",
            is_active: searchParams.get("is_active") || "",
        };

        setFilters(nextFilters);
        setAppliedFilters(nextFilters);
        setPageNumber(1);
    }, [searchParams]);

    useEffect(() => {
        const page = searchParams.get("page") || "";
        const section = searchParams.get("section") || "";

        if (!page || section || !isWebsitePageSlug(page)) {
            return;
        }

        const defaultSection = getWebsitePageDefaultSection(page);

        if (!defaultSection) {
            return;
        }

        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("section", defaultSection);
        setSearchParams(nextParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const loadContents = useCallback(async () => {
        if (isFocusedPageView) {
            setLoading(false);
            return;
        }

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
    }, [appliedFilters, isFocusedPageView, pageNumber, perPage]);

    useEffect(() => {
        loadContents();
    }, [loadContents]);

    const clearMessages = () => {
        setError("");
        setSuccess("");
        setFormError("");
    };

    const resetForm = () => {
        releaseAllImagePreviews(form);
        setSelectedContent(null);
        setForm(createEmptyForm(appliedFilters.page, appliedFilters.section));
        setActiveLanguage("en");
        setFormError("");
    };

    const openCreateModal = () => {
        clearMessages();
        resetForm();
        setFormModalOpen(true);
    };

    const openEditModal = (content) => {
        clearMessages();
        releaseAllImagePreviews(form);
        setSelectedContent(content);
        setForm(formFromContent(content, content.page, content.section));
        setActiveLanguage("en");
        setFormError("");
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (saving) return;
        setFormModalOpen(false);
        resetForm();
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((current) => ({ ...current, [name]: value }));
    };

    const syncFiltersToUrl = (nextFilters) => {
        const params = new URLSearchParams();

        if (nextFilters.search.trim()) params.set("search", nextFilters.search.trim());
        if (nextFilters.page.trim()) params.set("page", nextFilters.page.trim());
        if (nextFilters.section.trim()) params.set("section", nextFilters.section.trim());
        if (nextFilters.is_active !== "") params.set("is_active", nextFilters.is_active);

        setSearchParams(params, { replace: true });
    };

    const applyFilters = (event) => {
        event.preventDefault();
        setPageNumber(1);
        syncFiltersToUrl(filters);
    };

    const clearFilters = () => {
        setFilters({ search: "", page: "", section: "", is_active: "" });
        setPageNumber(1);
        setSearchParams({}, { replace: true });
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
            [field]: { ...current[field], [language]: value },
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const schema = resolveFormSchema(form.page, form.section);
        const validationMessage = validateSectionForm(form, schema, {
            isEdit: Boolean(selectedContent),
        });

        if (validationMessage) {
            setFormError(validationMessage);
            return;
        }

        setSaving(true);
        setFormError("");
        setError("");
        setSuccess("");

        try {
            const payload = buildSectionPayload(form, schema, {
                isEdit: Boolean(selectedContent),
            });

            if (selectedContent) {
                await siteContentApi.updateContent(selectedContent.id, payload);
                setSuccess("Content updated successfully.");
            } else {
                await siteContentApi.createContent(payload);
                setSuccess("Content created successfully.");
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
            setSuccess(nextStatus ? "Content activated." : "Content deactivated.");
            setContents((current) =>
                current.map((item) =>
                    item.id === content.id ? { ...item, is_active: nextStatus } : item
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
        if (actionType === "delete" && actionId) return;
        setDeleteModalOpen(false);
        setSelectedContent(null);
    };

    const confirmDelete = async () => {
        if (!selectedContent) return;

        setActionId(selectedContent.id);
        setActionType("delete");
        setError("");
        setSuccess("");

        try {
            await siteContentApi.deleteContent(selectedContent.id);
            setDeleteModalOpen(false);
            setSelectedContent(null);
            setSuccess("Content deleted successfully.");

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
                            {content.section}
                            {content.content_key ? ` · ${content.content_key}` : ""}
                        </p>
                    </div>
                ),
            },
            {
                header: "Location",
                accessor: "page",
                render: (content) => (
                    <div>
                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            {getPageLabel(content.page)}
                        </span>
                        <p className="mt-1 text-xs text-content-muted">{content.section}</p>
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
                            const available = hasLanguageContent(content, language.code);
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
                render: (content) => {
                    const count = countRecordMedia(content);

                    if (count === 0) {
                        return (
                            <span className="text-xs text-content-muted">No files</span>
                        );
                    }

                    return (
                        <span className="text-xs font-semibold text-content-secondary">
                            {count} {count === 1 ? "file" : "files"}
                        </span>
                    );
                },
            },
            {
                header: "Status",
                accessor: "is_active",
                render: (content) => (
                    <button
                        type="button"
                        onClick={() => handleStatusChange(content)}
                        disabled={actionId === content.id && actionType === "status"}
                        className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                            content.is_active
                                ? "bg-theme-success-bg text-theme-success-text"
                                : "bg-theme-surface-soft text-content-secondary",
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

    const pageSectionOptions = useMemo(() => {
        if (!form.page) return [];
        return getPageSections(form.page);
    }, [form.page]);

    return (
        <section className="space-y-6">
            {!isFocusedPageView ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
                            <Languages size={14} />
                            Content library
                        </div>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-content">
                            Website Content
                        </h1>

                        <p className="mt-1 text-sm text-content-muted">
                            Browse all content records or open a page from the sidebar.
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
            ) : null}

            {error ? (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button type="button" onClick={() => setError("")} aria-label="Close error">
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            {success ? (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text"
                >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{success}</p>
                    <button type="button" onClick={() => setSuccess("")} aria-label="Close success">
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            {isWebsitePageEditorView ? (
                <WebsitePageEditor
                    page={appliedFilters.page}
                    section={appliedFilters.section}
                    onSaved={() => setSuccess("Changes saved.")}
                />
            ) : isHomeSectionEditorView ? (
                <SectionContentEditor
                    page={appliedFilters.page}
                    section={appliedFilters.section}
                    onSaved={() => setSuccess("Changes saved.")}
                />
            ) : (
                <>
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
                                    placeholder="Search title, section…"
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
                </>
            )}

            <Modal
                open={formModalOpen}
                title={selectedContent ? "Edit content" : "Add content"}
                onClose={closeFormModal}
                size="lg"
                closeDisabled={saving}
            >
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Page *</span>
                            <select
                                name="page"
                                value={form.page}
                                onChange={handleBasicFieldChange}
                                required
                                className="h-10 w-full rounded-lg border border-line bg-theme-surface px-3 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                            >
                                {PAGE_OPTIONS.map((page) => (
                                    <option key={page.value} value={page.value}>
                                        {page.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1.5 text-sm font-medium text-content-secondary">
                            <span>Section *</span>
                            {pageSectionOptions.length > 0 ? (
                                <select
                                    name="section"
                                    value={form.section}
                                    onChange={handleBasicFieldChange}
                                    required
                                    className="h-10 w-full rounded-lg border border-line bg-theme-surface px-3 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                >
                                    <option value="">Select section</option>
                                    {pageSectionOptions.map((entry) => (
                                        <option key={entry.section} value={entry.section}>
                                            {entry.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="section"
                                    value={form.section}
                                    onChange={handleBasicFieldChange}
                                    required
                                    placeholder="hero"
                                    className="h-10 w-full rounded-lg border border-line px-3 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                />
                            )}
                        </label>
                    </div>

                    {formSchema?.description ? (
                        <p className="text-sm text-content-muted">{formSchema.description}</p>
                    ) : null}

                    <SiteContentSectionForm
                        schema={formSchema}
                        form={form}
                        activeLanguage={activeLanguage}
                        onLanguageChange={setActiveLanguage}
                        onTranslationChange={handleTranslationChange}
                        onBasicFieldChange={handleBasicFieldChange}
                        onImageChange={handleImageChange}
                        onRemoveImage={removeSelectedImage}
                        onRestoreImage={restoreExistingImage}
                        onAddImages={handleAddImages}
                        onRemoveExistingImage={handleRemoveExistingImage}
                        onRemoveNewImage={handleRemoveNewImage}
                        visibleExistingImages={visibleExistingImages}
                        imagePreview={imagePreview}
                        formError={formError}
                        saving={saving}
                        submitLabel={selectedContent ? "Save changes" : "Add content"}
                        onSubmit={handleSubmit}
                        onCancel={closeFormModal}
                    />
                </div>
            </Modal>

            <Modal
                open={deleteModalOpen}
                title="Delete content"
                onClose={closeDeleteModal}
                size="sm"
                closeDisabled={actionType === "delete"}
            >
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-content-secondary">
                        Delete <strong>{getDisplayTitle(selectedContent)}</strong>? This cannot
                        be undone.
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
                            {actionType === "delete" ? (
                                <LoaderCircle size={16} className="animate-spin" />
                            ) : null}
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default SiteContents;
