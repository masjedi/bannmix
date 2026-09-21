import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    LoaderCircle,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import siteContentApi from "../../../api/siteContentApi";
import DataTable from "../../DataTable";
import Modal from "../../Modal";

import SiteContentSectionForm from "./SiteContentSectionForm";
import {
    getPageLabel,
    getPageSections,
    LANGUAGE_OPTIONS,
    resolveFormSchema,
} from "./siteContentFormSchemas";
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
} from "./siteContentFormUtils";
import useSiteContentImageForm from "./useSiteContentImageForm";
import { invalidateCachedPublicPage } from "../../../utils/publicContentCache";

const SectionContentEditor = ({ page, section, embedded = false, onSaved }) => {
    const schema = useMemo(
        () => (section ? resolveFormSchema(page, section) : null),
        [page, section]
    );

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [actionType, setActionType] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    const [form, setForm] = useState(() => createEmptyForm(page, section));
    const [activeLanguage, setActiveLanguage] = useState("en");
    const [editingRecord, setEditingRecord] = useState(null);
    const [formModalOpen, setFormModalOpen] = useState(false);

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

    const loadRecords = useCallback(async () => {
        if (!page || !section || !schema) {
            setRecords([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await siteContentApi.getContents({
                content_page: page,
                section,
                per_page: 100,
            });

            const normalized = extractListResponse(response);
            const sorted = [...normalized.records].sort(
                (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );

            setRecords(sorted);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, [page, schema, section]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const resetFormState = useCallback(() => {
        releaseAllImagePreviews(form);
        setEditingRecord(null);
        setForm(createEmptyForm(page, section));
        setActiveLanguage("en");
        setFormError("");
    }, [form, page, releaseAllImagePreviews, section]);

    const openCreateItem = () => {
        resetFormState();
        setForm((current) => ({
            ...current,
            sort_order: records.length,
        }));
        setFormModalOpen(true);
    };

    const openEditItem = (record) => {
        releaseAllImagePreviews(form);
        setEditingRecord(record);
        setForm(formFromContent(record, page, section));
        setActiveLanguage("en");
        setFormError("");
        setFormModalOpen(true);
    };

    const closeFormModal = () => {
        if (saving) return;
        setFormModalOpen(false);
        resetFormState();
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationMessage = validateSectionForm(form, schema, {
            isEdit: Boolean(editingRecord),
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
                isEdit: Boolean(editingRecord),
            });

            if (editingRecord) {
                await siteContentApi.updateContent(editingRecord.id, payload);
                setSuccess("Changes saved.");
            } else {
                await siteContentApi.createContent(payload);
                setSuccess("Item created.");
            }

            setFormModalOpen(false);
            resetFormState();
            invalidateCachedPublicPage(page);
            await loadRecords();
            onSaved?.();
        } catch (requestError) {
            setFormError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (record) => {
        setActionId(record.id);
        setActionType("status");
        setError("");

        try {
            const nextStatus = !record.is_active;
            await siteContentApi.updateContentStatus(record.id, nextStatus);

            setSuccess(nextStatus ? "Item activated." : "Item deactivated.");
            invalidateCachedPublicPage(page);
            setRecords((current) =>
                current.map((item) =>
                    item.id === record.id ? { ...item, is_active: nextStatus } : item
                )
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setActionId(null);
            setActionType("");
        }
    };

    const handleDelete = async (record) => {
        if (!window.confirm(`Delete "${getDisplayTitle(record)}"?`)) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            await siteContentApi.deleteContent(record.id);
            setSuccess("Item deleted.");
            await loadRecords();
            onSaved?.();
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const tableColumns = useMemo(
        () => [
            {
                header: "Content",
                accessor: "content_key",
                render: (record) => (
                    <div className="max-w-sm">
                        <p className="truncate font-semibold text-content">
                            {getDisplayTitle(record)}
                        </p>
                        {record.content_key ? (
                            <p className="mt-1 truncate text-xs text-content-muted">
                                {record.content_key}
                            </p>
                        ) : null}
                    </div>
                ),
            },
            {
                header: "Languages",
                key: "languages",
                sortable: false,
                searchable: false,
                render: (record) => (
                    <div className="flex flex-wrap gap-1.5">
                        {LANGUAGE_OPTIONS.map((language) => {
                            const available = hasLanguageContent(record, language.code);

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
                render: (record) => {
                    const count = countRecordMedia(record);

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
                header: "Order",
                accessor: "sort_order",
                align: "center",
                render: (record) => (
                    <span className="font-semibold text-content-secondary">
                        {record.sort_order ?? 0}
                    </span>
                ),
            },
            {
                header: "Status",
                accessor: "is_active",
                render: (record) => (
                    <button
                        type="button"
                        onClick={() => handleStatusChange(record)}
                        disabled={actionId === record.id && actionType === "status"}
                        className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                            record.is_active
                                ? "bg-theme-success-bg text-theme-success-text"
                                : "bg-theme-surface-soft text-content-secondary",
                        ].join(" ")}
                    >
                        {actionId === record.id && actionType === "status" ? (
                            <LoaderCircle size={13} className="animate-spin" />
                        ) : record.is_active ? (
                            <Eye size={13} />
                        ) : (
                            <EyeOff size={13} />
                        )}
                        {record.is_active ? "Active" : "Inactive"}
                    </button>
                ),
            },
        ],
        [actionId, actionType]
    );

    if (!page) {
        return null;
    }

    if (!section) {
        const sections = getPageSections(page);

        return (
            <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
                <h2 className="text-xl font-bold text-content">Choose a section</h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {sections.map((entry) => (
                        <Link
                            key={entry.section}
                            to={`/admin/site-contents?page=${page}&section=${entry.section}`}
                            className="rounded-xl border border-line bg-theme-page px-4 py-4 transition hover:border-brand-orange hover:bg-brand-orange/5"
                        >
                            <p className="font-semibold text-content">{entry.label}</p>
                            <p className="mt-2 text-xs font-medium text-brand-orange">
                                {entry.mode === "list" ? "Multiple items" : "Single block"}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    if (!schema) {
        return (
            <div className="rounded-2xl border border-line bg-theme-surface p-5 text-sm text-content-muted">
                No form is configured for this section yet.
            </div>
        );
    }

    const emptyLabel = schema.itemLabel ?? schema.label ?? "item";

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {embedded ? (
                    <p className="text-sm text-content-muted">
                        Add, edit, or delete hero records. The first active row is shown on the
                        public page.
                    </p>
                ) : (
                    <div className="min-w-0">
                        <Link
                            to={`/admin/site-contents?page=${page}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline"
                        >
                            <ArrowLeft size={14} />
                            {getPageLabel(page)} sections
                        </Link>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-content">
                            {schema.label}
                        </h2>
                    </div>
                )}

                <button
                    type="button"
                    onClick={openCreateItem}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-semibold text-white shadow-sm shadow-brand-orange/20 transition hover:bg-brand-orange/90"
                >
                    <Plus size={16} />
                    Add New
                </button>
            </div>

            {error ? (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button type="button" onClick={() => setError("")} aria-label="Close error">
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            {success ? (
                <div className="flex items-start gap-3 rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{success}</p>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Close success"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            <DataTable
                title={`${schema.label} content`}
                subtitle={`${records.length} ${records.length === 1 ? emptyLabel : `${emptyLabel}s`}`}
                columns={tableColumns}
                data={records}
                loading={loading}
                rowKey="id"
                searchable={false}
                onRefresh={loadRecords}
                refreshLoading={loading}
                exportable={false}
                printable={false}
                emptyText={`No ${emptyLabel.toLowerCase()} yet. Click Add New to create one.`}
                showIndex
                pagination={records.length > 10}
                defaultPageSize={10}
                actions={(record) => (
                    <>
                        <button
                            type="button"
                            onClick={() => openEditItem(record)}
                            title="Edit"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-content-secondary transition hover:border-brand-orange hover:bg-brand-orange/5 hover:text-brand-orange"
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(record)}
                            disabled={saving}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                            <Trash2 size={15} />
                        </button>
                    </>
                )}
            />

            <Modal
                open={formModalOpen}
                title={editingRecord ? `Edit ${schema.label}` : `Add New ${schema.label}`}
                onClose={closeFormModal}
                size="lg"
                closeDisabled={saving}
            >
                <SiteContentSectionForm
                    schema={schema}
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
                    submitLabel={editingRecord ? "Save changes" : "Add New"}
                    onSubmit={handleSubmit}
                    onCancel={closeFormModal}
                    compact
                />
            </Modal>
        </div>
    );
};

export default SectionContentEditor;
