import { useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getReadableFileSize = (size) => {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (fileName) => {
    const parts = fileName.split(".");

    return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const getDefaultAttachmentName = (fileName) => {
    return fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
};

const createFileId = () => {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const RegistrationFileUpload = ({
    value = [],
    onChange,
    isDisabled = false,
    maxFiles = 10,
}) => {
    const [error, setError] = useState("");

    const updateValue = (files) => {
        if (typeof onChange === "function") {
            onChange(files);
        }
    };

    const handleDropFiles = (files) => {
        setError("");

        const selectedFiles = Array.from(files);
        const availableSlots = Math.max(maxFiles - value.length, 0);

        if (availableSlots === 0) {
            setError(`You can upload a maximum of ${maxFiles} files.`);
            return;
        }

        const acceptedFiles = [];
        const rejectedFiles = [];

        selectedFiles.slice(0, availableSlots).forEach((file) => {
            const extension = getFileExtension(file.name);
            const validExtension = ACCEPTED_EXTENSIONS.includes(extension);
            const validSize = file.size <= MAX_FILE_SIZE;

            if (!validExtension || !validSize) {
                rejectedFiles.push(file.name);
                return;
            }

            acceptedFiles.push({
                id: createFileId(),
                name: getDefaultAttachmentName(file.name),
                fileName: file.name,
                file,
                type: extension,
                size: file.size,
                progress: 100,
                failed: false,
            });
        });

        if (acceptedFiles.length > 0) {
            updateValue([...value, ...acceptedFiles]);
        }

        if (selectedFiles.length > availableSlots) {
            setError(
                `Only ${availableSlots} more file${
                    availableSlots === 1 ? "" : "s"
                } can be added.`
            );
            return;
        }

        if (rejectedFiles.length > 0) {
            setError(
                `Some files were rejected: ${rejectedFiles.join(
                    ", "
                )}. Only JPG, JPEG, PNG, and PDF files up to ${getReadableFileSize(
                    MAX_FILE_SIZE
                )} are allowed.`
            );
        }
    };

    const handleDeleteFile = (id) => {
        setError("");
        updateValue(value.filter((file) => file.id !== id));
    };

    const handleAttachmentNameChange = (id, attachmentName) => {
        updateValue(
            value.map((file) =>
                file.id === id
                    ? {
                          ...file,
                          name: attachmentName,
                      }
                    : file
            )
        );
    };

    return (
        <div className="space-y-3">
            <label
                className={[
                    "flex min-h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed px-5 py-6 text-center transition",
                    isDisabled || value.length >= maxFiles
                        ? "cursor-not-allowed border-line bg-theme-page opacity-60"
                        : "cursor-pointer border-line-strong bg-theme-surface hover:border-brand-orange hover:bg-brand-orange/5",
                ].join(" ")}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault();

                    if (!isDisabled && value.length < maxFiles) {
                        handleDropFiles(event.dataTransfer.files);
                    }
                }}
            >
                <UploadCloud size={30} className="text-brand-orange" />
                <span className="mt-3 text-sm font-semibold text-content-secondary">
                    Drop files here or click to browse
                </span>
                <span className="mt-1 text-xs font-normal text-content-muted">
                    You can select multiple files
                </span>
                <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    disabled={isDisabled || value.length >= maxFiles}
                    onChange={(event) => {
                        handleDropFiles(event.target.files || []);
                        event.target.value = "";
                    }}
                    className="sr-only"
                />
            </label>

            {value.length > 0 && (
                <div className="space-y-3">
                    {value.map((uploadedFile) => (
                        <div
                            key={uploadedFile.id}
                            className="grid gap-3 rounded-xl border border-line bg-theme-surface p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                        >
                            <div className="min-w-0">
                                <label>
                                    <span className="mb-1.5 block text-xs font-semibold text-content-secondary">
                                        Attachment name
                                    </span>
                                    <input
                                        type="text"
                                        value={uploadedFile.name}
                                        onChange={(event) =>
                                            handleAttachmentNameChange(
                                                uploadedFile.id,
                                                event.target.value
                                            )
                                        }
                                        disabled={isDisabled}
                                        placeholder="Example: Tazkira"
                                        required
                                        className="mb-0 h-10"
                                    />
                                </label>
                                <p className="mt-2 flex min-w-0 items-center gap-2 text-xs text-content-muted">
                                    <FileText
                                        size={14}
                                        className="shrink-0 text-content-muted"
                                    />
                                    <span className="truncate">
                                        {uploadedFile.fileName}
                                    </span>
                                    <span className="shrink-0">
                                        {getReadableFileSize(uploadedFile.size)}
                                    </span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    handleDeleteFile(uploadedFile.id)
                                }
                                disabled={isDisabled}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label={`Remove ${uploadedFile.fileName}`}
                            >
                                <Trash2 size={15} />
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-content-muted">
                <span>
                    Accepted: JPG, JPEG, PNG, or PDF. Maximum{" "}
                    {getReadableFileSize(MAX_FILE_SIZE)} per file.
                </span>

                <span>
                    {value.length}/{maxFiles} files
                </span>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default RegistrationFileUpload;
