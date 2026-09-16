import { useEffect, useId } from "react";

const Modal = ({
    open,
    title,
    children,
    onClose,
    size = "md",
    closeDisabled = false,
}) => {
    const titleId = useId();

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !closeDisabled) {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;

            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose, closeDisabled]);

    if (!open) {
        return null;
    }

    const sizeClasses = {
        sm: "max-w-lg",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
        full: "max-w-[95vw]",
    };

    const modalSize = sizeClasses[size] || sizeClasses.md;

    const handleBackdropClick = () => {
        if (!closeDisabled) {
            onClose?.();
        }
    };

    return (
        <div
            className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 backdrop-blur-[1px]"
            onMouseDown={handleBackdropClick}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onMouseDown={(event) => event.stopPropagation()}
                className={`theme-modal flex max-h-[92vh] w-full flex-col overflow-hidden ${modalSize}`}
            >
                <div className="flex shrink-0 items-center justify-between bg-theme-surface-soft px-6 py-4">
                    <h2
                        id={titleId}
                        className="text-lg font-semibold text-content"
                    >
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={closeDisabled}
                        aria-label="Close modal"
                        className="icon-btn h-9 w-9 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
