import { Image as ImageIcon, Trash2 } from "lucide-react";

const MultiImageInput = ({
    label,
    hint,
    required = false,
    existingImages = [],
    newImages = [],
    onAddImages,
    onRemoveExisting,
    onRemoveNew,
}) => {
    const totalCount = existingImages.length + newImages.length;

    return (
        <div className="space-y-3 md:col-span-2">
            <div>
                <p className="text-sm font-medium text-content-secondary">
                    {label}
                    {required ? " *" : ""}
                </p>
                {hint ? (
                    <p className="mt-1 text-xs text-content-muted">{hint}</p>
                ) : null}
            </div>

            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-theme-page px-4 text-center transition hover:border-brand-orange hover:bg-brand-orange/5">
                <ImageIcon size={22} className="text-content-muted" />
                <span className="mt-2 text-sm font-semibold text-content-secondary">
                    Choose images
                </span>
                <span className="mt-1 text-xs text-content-muted">
                    Select one or more · JPG, PNG, WebP, AVIF · up to 5 MB each
                </span>
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    onChange={onAddImages}
                    className="sr-only"
                />
            </label>

            {totalCount > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map((image) => (
                        <div
                            key={image.path}
                            className="relative overflow-hidden rounded-xl border border-line bg-theme-page"
                        >
                            <img
                                src={image.url}
                                alt=""
                                className="aspect-square w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveExisting(image.path)}
                                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-theme-surface/90 text-red-600 shadow"
                                aria-label="Remove image"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}

                    {newImages.map((image) => (
                        <div
                            key={image.id}
                            className="relative overflow-hidden rounded-xl border border-line bg-theme-page"
                        >
                            <img
                                src={image.preview}
                                alt=""
                                className="aspect-square w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveNew(image.id)}
                                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-theme-surface/90 text-red-600 shadow"
                                aria-label="Remove image"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-line text-sm text-content-muted">
                    No images selected yet
                </div>
            )}
        </div>
    );
};

export default MultiImageInput;
