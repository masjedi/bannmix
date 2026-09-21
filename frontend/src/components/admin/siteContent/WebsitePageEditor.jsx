import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertCircle,
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
import Modal from "../../Modal";

import SectionContentEditor from "./SectionContentEditor";
import SiteContentSectionForm from "./SiteContentSectionForm";
import {
    getPageLabel,
    getSectionSchema,
    getWebsitePageSections,
    LANGUAGE_OPTIONS,
    usesHeroDataTable,
} from "./siteContentFormSchemas";
import {
    buildSectionPayload,
    createEmptyForm,
    extractListResponse,
    formFromContent,
    getDisplayTitle,
    getErrorMessage,
    hasLanguageContent,
    validateSectionForm,
} from "./siteContentFormUtils";
import useSiteContentImageForm from "./useSiteContentImageForm";

const WebsitePageSectionEditor = ({ page, schema, onSaved }) => {
    const isList = schema.mode === "list";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");

    const [record, setRecord] = useState(null);
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState(() => createEmptyForm(page, schema.section));
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

    const loadSection = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await siteContentApi.getContents({
                content_page: page,
                section: schema.section,
                per_page: 100,
            });

            const normalized = extractListResponse(response);
            const sorted = [...normalized.records].sort(
                (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );

            if (isList) {
                setRecords(sorted);
            } else {
                const first = sorted[0] ?? null;
                setRecord(first);
                setForm(
                    first
                        ? formFromContent(first, page, schema.section)
                        : createEmptyForm(page, schema.section)
                );
            }
        } catch (requestError) {
            setError(getErrorMessage(requestError));
            if (isList) {
                setRecords([]);
            } else {
                setRecord(null);
                setForm(createEmptyForm(page, schema.section));
            }
        } finally {
            setLoading(false);
        }
    }, [isList, page, schema.section]);

    useEffect(() => {
        loadSection();
    }, [loadSection]);

    const resetFormState = () => {
        releaseAllImagePreviews(form);
        setEditingRecord(null);
        setForm(createEmptyForm(page, schema.section));
        setActiveLanguage("en");
        setFormError("");
    };

    const openCreateItem = () => {
        resetFormState();
        setForm((current) => ({
            ...current,
            sort_order: records.length,
        }));
        setFormModalOpen(true);
    };

    const openEditItem = (item) => {
        releaseAllImagePreviews(form);
        setEditingRecord(item);
        setForm(formFromContent(item, page, schema.section));
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

    const saveForm = async (event) => {
        event.preventDefault();

        const isEdit = isList ? Boolean(editingRecord) : Boolean(record);
        const validationMessage = validateSectionForm(form, schema, { isEdit });

        if (validationMessage) {
            setFormError(validationMessage);
            return;
        }

        setSaving(true);
        setFormError("");
        setError("");
        setSuccess("");

        try {
            const payload = buildSectionPayload(form, schema, { isEdit });

            if (isList) {
                if (editingRecord) {
                    await siteContentApi.updateContent(editingRecord.id, payload);
                    setSuccess("Item updated.");
                } else {
                    await siteContentApi.createContent(payload);
                    setSuccess("Item added.");
                }

                setFormModalOpen(false);
                resetFormState();
            } else if (record) {
                await siteContentApi.updateContent(record.id, payload);
                setSuccess("Changes saved.");
            } else {
                await siteContentApi.createContent(payload);
                setSuccess("Content saved.");
            }

            await loadSection();
            onSaved?.();
        } catch (requestError) {
            setFormError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (item) => {
        setActionId(item.id);
        setError("");

        try {
            const nextStatus = !item.is_active;
            await siteContentApi.updateContentStatus(item.id, nextStatus);
            setSuccess(nextStatus ? "Item activated." : "Item deactivated.");

            setRecords((current) =>
                current.map((entry) =>
                    entry.id === item.id ? { ...entry, is_active: nextStatus } : entry
                )
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${getDisplayTitle(item)}"?`)) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            await siteContentApi.deleteContent(item.id);
            setSuccess("Item deleted.");
            await loadSection();
            onSaved?.();
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const itemLabel = schema.itemLabel ?? schema.label ?? "item";

    return (
        <div className="rounded-2xl border border-line bg-theme-surface p-5 shadow-sm">
            {schema.description ? (
                <p className="mb-5 text-sm text-content-muted">{schema.description}</p>
            ) : null}

            {error ? (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button type="button" onClick={() => setError("")} aria-label="Close error">
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            {success ? (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-theme-success-text/20 bg-theme-success-bg px-4 py-3 text-sm text-theme-success-text">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{success}</p>
                    <button type="button" onClick={() => setSuccess("")} aria-label="Close success">
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            {loading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-content-muted">
                    <LoaderCircle size={18} className="animate-spin" />
                    Loading…
                </div>
            ) : isList ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-content-muted">
                            {records.length}{" "}
                            {records.length === 1 ? itemLabel : `${itemLabel}s`}
                        </p>
                        <button
                            type="button"
                            onClick={openCreateItem}
                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand-orange px-3 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                        >
                            <Plus size={15} />
                            Add {itemLabel}
                        </button>
                    </div>

                    {records.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-line bg-theme-page px-4 py-8 text-center text-sm text-content-muted">
                            No {itemLabel.toLowerCase()}s yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {records.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex flex-col gap-3 rounded-xl border border-line bg-theme-page px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-content">
                                            {getDisplayTitle(item)}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {LANGUAGE_OPTIONS.map((language) => (
                                                <span
                                                    key={language.code}
                                                    className={[
                                                        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                                                        hasLanguageContent(item, language.code)
                                                            ? "bg-theme-success-bg text-theme-success-text"
                                                            : "bg-theme-surface-soft text-content-muted",
                                                    ].join(" ")}
                                                >
                                                    {language.code}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleStatusChange(item)}
                                            disabled={actionId === item.id}
                                            className={[
                                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60",
                                                item.is_active
                                                    ? "bg-theme-success-bg text-theme-success-text"
                                                    : "bg-theme-surface-soft text-content-secondary",
                                            ].join(" ")}
                                        >
                                            {actionId === item.id ? (
                                                <LoaderCircle size={12} className="animate-spin" />
                                            ) : item.is_active ? (
                                                <Eye size={12} />
                                            ) : (
                                                <EyeOff size={12} />
                                            )}
                                            {item.is_active ? "Active" : "Hidden"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openEditItem(item)}
                                            title="Edit"
                                            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-content-secondary transition hover:border-brand-orange hover:text-brand-orange"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item)}
                                            disabled={saving}
                                            title="Delete"
                                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Modal
                        open={formModalOpen}
                        title={
                            editingRecord ? `Edit ${schema.label}` : `Add ${itemLabel}`
                        }
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
                            submitLabel={editingRecord ? "Save changes" : `Add ${itemLabel}`}
                            onSubmit={saveForm}
                            onCancel={closeFormModal}
                            compact
                        />
                    </Modal>
                </div>
            ) : (
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
                    submitLabel={record ? "Save changes" : "Save content"}
                    onSubmit={saveForm}
                    compact
                />
            )}
        </div>
    );
};

const WebsitePageEditor = ({ page, section, onSaved }) => {
    const sections = getWebsitePageSections(page);
    const schema = useMemo(
        () => getSectionSchema(page, section),
        [page, section]
    );

    if (!page || sections.length === 0) {
        return (
            <div className="rounded-2xl border border-line bg-theme-surface p-5 text-sm text-content-muted">
                No sections are configured for this page yet.
            </div>
        );
    }

    if (!section || !schema) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-content">
                    {getPageLabel(page)}
                </h2>
                <p className="mt-1 text-sm text-content-muted">
                    {schema.label} — fill any one language; Pashto and Dari are optional.
                </p>
            </div>

            {sections.length > 1 ? (
                <div className="flex flex-wrap gap-2">
                    {sections.map((entry) => (
                        <Link
                            key={entry.section}
                            to={`/admin/site-contents?page=${page}&section=${entry.section}`}
                            className={[
                                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                                entry.section === section
                                    ? "bg-brand-orange text-white shadow-sm"
                                    : "border border-line bg-theme-surface text-content-secondary hover:border-brand-orange hover:text-brand-orange",
                            ].join(" ")}
                        >
                            {entry.label}
                        </Link>
                    ))}
                </div>
            ) : null}

            {usesHeroDataTable(page, section) ? (
                <SectionContentEditor
                    key={`${page}-${section}`}
                    page={page}
                    section={section}
                    embedded
                    onSaved={onSaved}
                />
            ) : (
                <WebsitePageSectionEditor
                    key={`${page}-${section}`}
                    page={page}
                    schema={schema}
                    onSaved={onSaved}
                />
            )}
        </div>
    );
};

export default WebsitePageEditor;
