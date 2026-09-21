import { AlertCircle, Image as ImageIcon, LoaderCircle, Trash2 } from "lucide-react";

import TextEditor from "../../TextEditor";
import MultiImageInput from "./MultiImageInput";
import { LANGUAGE_OPTIONS, TRANSLATABLE_KEYS } from "./siteContentFormSchemas";

const inputClassName =
    "h-10 w-full rounded-lg border border-line bg-theme-surface px-3 text-content-secondary outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

const textareaClassName =
    "w-full rounded-lg border border-line bg-theme-surface px-3 py-2 text-content-secondary outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20";

const SiteContentSectionForm = ({
    schema,
    form,
    activeLanguage,
    onLanguageChange,
    onTranslationChange,
    onBasicFieldChange,
    onImageChange,
    onRemoveImage,
    onRestoreImage,
    imagePreview,
    onAddImages,
    onRemoveExistingImage,
    onRemoveNewImage,
    visibleExistingImages = [],
    formError,
    saving,
    submitLabel = "Save",
    onSubmit,
    onCancel,
    showActiveToggle = true,
    compact = false,
}) => {
    const fields = schema?.fields ?? [];

    const renderField = (field) => {
        if (field.type === "images") {
            return (
                <MultiImageInput
                    key={field.key}
                    label={field.label}
                    hint={field.hint}
                    required={field.required}
                    existingImages={visibleExistingImages}
                    newImages={form.new_images ?? []}
                    onAddImages={onAddImages}
                    onRemoveExisting={onRemoveExistingImage}
                    onRemoveNew={onRemoveNewImage}
                />
            );
        }

        if (field.type === "image") {
            return (
                <div key={field.key} className={compact ? "space-y-2" : "grid gap-4 md:grid-cols-2"}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-content-secondary">
                            {field.label}
                            {field.required ? " *" : ""}
                        </label>
                        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-theme-page px-4 text-center transition hover:border-brand-orange hover:bg-brand-orange/5">
                            <ImageIcon size={22} className="text-content-muted" />
                            <span className="mt-2 text-sm font-semibold text-content-secondary">
                                Choose image
                            </span>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                                onChange={onImageChange}
                                className="sr-only"
                            />
                        </label>
                        {field.hint ? (
                            <p className="text-xs text-content-muted">{field.hint}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-content-secondary">Preview</p>
                        {imagePreview ? (
                            <div className="relative overflow-hidden rounded-xl border border-line bg-theme-page">
                                <img
                                    src={imagePreview}
                                    alt=""
                                    className="h-28 w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={onRemoveImage}
                                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-theme-surface/90 text-red-600 shadow"
                                    aria-label="Remove image"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ) : form.image_url && form.remove_image ? (
                            <button
                                type="button"
                                onClick={onRestoreImage}
                                className="h-28 w-full rounded-xl border border-dashed border-line-strong text-sm font-semibold text-content-secondary hover:border-brand-orange hover:text-brand-orange"
                            >
                                Restore existing image
                            </button>
                        ) : (
                            <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-line text-sm text-content-muted">
                                No image selected
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (field.type === "url") {
            return (
                <label
                    key={field.key}
                    className="block space-y-1.5 text-sm font-medium text-content-secondary"
                >
                    <span>
                        {field.label}
                        {field.required ? " *" : ""}
                    </span>
                    <input
                        type="text"
                        name={field.key}
                        value={form[field.key] ?? ""}
                        onChange={onBasicFieldChange}
                        placeholder="/products or https://…"
                        className={inputClassName}
                    />
                    {field.hint ? (
                        <span className="block text-xs font-normal text-content-muted">
                            {field.hint}
                        </span>
                    ) : null}
                </label>
            );
        }

        if (field.type === "editor") {
            return (
                <div
                    key={field.key}
                    className="space-y-1.5 text-sm font-medium text-content-secondary md:col-span-2"
                >
                    <span>
                        {field.label}
                        {field.required ? " *" : ""}
                    </span>
                    <TextEditor
                        value={form[field.key]?.[activeLanguage] ?? ""}
                        onChange={(html) =>
                            onTranslationChange(field.key, activeLanguage, html)
                        }
                        dir={activeLanguage === "en" ? "ltr" : "rtl"}
                        placeholder={`Write ${field.label.toLowerCase()}…`}
                        minHeight="11rem"
                    />
                    {field.hint ? (
                        <span className="block text-xs font-normal text-content-muted">
                            {field.hint}
                        </span>
                    ) : null}
                </div>
            );
        }

        if (field.type === "textarea") {
            return (
                <label
                    key={field.key}
                    className="block space-y-1.5 text-sm font-medium text-content-secondary md:col-span-2"
                >
                    <span>
                        {field.label}
                        {field.required ? " *" : ""}
                    </span>
                    <textarea
                        rows={field.rows ?? 4}
                        value={form[field.key]?.[activeLanguage] ?? ""}
                        onChange={(event) =>
                            onTranslationChange(field.key, activeLanguage, event.target.value)
                        }
                        className={textareaClassName}
                    />
                    {field.hint ? (
                        <span className="block text-xs font-normal text-content-muted">
                            {field.hint}
                        </span>
                    ) : null}
                </label>
            );
        }

        const isTranslatable = TRANSLATABLE_KEYS.has(field.key);

        return (
            <label
                key={field.key}
                className="block space-y-1.5 text-sm font-medium text-content-secondary"
            >
                <span>
                    {field.label}
                    {field.required ? " *" : ""}
                </span>
                <input
                    type="text"
                    value={
                        isTranslatable
                            ? form[field.key]?.[activeLanguage] ?? ""
                            : form[field.key] ?? ""
                    }
                    onChange={(event) => {
                        if (isTranslatable) {
                            onTranslationChange(
                                field.key,
                                activeLanguage,
                                event.target.value
                            );
                            return;
                        }

                        onBasicFieldChange({
                            target: {
                                name: field.key,
                                value: event.target.value,
                            },
                        });
                    }}
                    className={inputClassName}
                />
                {field.hint ? (
                    <span className="block text-xs font-normal text-content-muted">
                        {field.hint}
                    </span>
                ) : null}
            </label>
        );
    };

    const textFields = fields.filter(
        (field) => !["image", "images", "url", "youtube"].includes(field.type)
    );

    const imageFields = fields.filter((field) =>
        ["image", "images"].includes(field.type)
    );

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {formError ? (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{formError}</p>
                </div>
            ) : null}

            {textFields.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-line">
                    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-theme-page p-2">
                        {LANGUAGE_OPTIONS.map((language) => (
                            <button
                                key={language.code}
                                type="button"
                                onClick={() => onLanguageChange(language.code)}
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
                        <p className="ms-auto px-2 py-2 text-xs font-normal text-content-muted">
                            One language is enough
                        </p>
                    </div>

                    <div
                        className="grid gap-4 p-5 md:grid-cols-2"
                        dir={
                            LANGUAGE_OPTIONS.find(
                                (language) => language.code === activeLanguage
                            )?.direction
                        }
                    >
                        {textFields.map((field) => renderField(field))}
                    </div>
                </div>
            ) : null}

            {fields
                .filter((field) => field.type === "url" || field.type === "youtube")
                .map((field) => renderField(field))}

            {imageFields.length > 0 ? (
                <div className="space-y-4">{imageFields.map((field) => renderField(field))}</div>
            ) : null}

            {showActiveToggle ? (
                <label className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm font-medium text-content-secondary">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={onBasicFieldChange}
                        className="h-4 w-4 rounded border-line-strong text-brand-orange focus:ring-brand-orange"
                    />
                    Visible on the public website
                </label>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-line pt-4">
                {onCancel ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="h-10 rounded-lg border border-line px-4 text-sm font-semibold text-content-secondary transition hover:bg-theme-page disabled:opacity-60"
                    >
                        Cancel
                    </button>
                ) : null}
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-orange px-5 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? <LoaderCircle size={16} className="animate-spin" /> : null}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default SiteContentSectionForm;
