import { useEffect, useState } from "react";
import { Filter, RotateCcw, Search, X } from "lucide-react";

const EMPTY_FILTERS = {
    search: "",
    status: "",
    from_date: "",
    to_date: "",
};

const PostFilter = ({
    value = EMPTY_FILTERS,
    onChange,
    onApply,
    onClear,
    activeCount = 0,
    disabled = false,
}) => {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    const updateDraft = (event) => {
        const { name, value: fieldValue } = event.target;

        setDraft((previous) => ({
            ...previous,
            [name]: fieldValue,
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();

        onChange?.(draft);
        onApply?.(draft);
        setOpen(false);
    };

    const clearFilters = () => {
        setDraft(EMPTY_FILTERS);
        onChange?.(EMPTY_FILTERS);
        onClear?.();
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={disabled}
                aria-label="Open product filters"
                className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-theme-surface text-content-secondary shadow-sm transition hover:border-brand-orange hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Filter size={18} />

                {activeCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {activeCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed inset-0 z-[100]">
                    <button
                        type="button"
                        aria-label="Close filter panel"
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-theme-modal-backdrop backdrop-blur-[1px]"
                    />

                    <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-theme-surface shadow-2xl">
                        <div className="flex items-center justify-between border-b border-line px-5 py-4">
                            <div>
                                <h2 className="text-lg font-extrabold text-content">
                                    Filter Products
                                </h2>

                                <p className="mt-1 text-sm text-content-muted">
                                    Narrow the list by keyword, status, or date.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="grid h-9 w-9 place-items-center rounded-lg text-content-muted transition hover:bg-theme-surface-soft hover:text-content"
                                aria-label="Close filters"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-content-secondary">
                                        Search
                                    </label>

                                    <div className="relative">
                                        <Search
                                            size={16}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                                        />

                                        <input
                                            type="search"
                                            name="search"
                                            value={draft.search}
                                            onChange={updateDraft}
                                            placeholder="Title or description"
                                            className="w-full rounded-xl border border-line-strong py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-content-secondary">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={draft.status}
                                        onChange={updateDraft}
                                        className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        <option value="">All statuses</option>
                                        <option value="published">
                                            Published
                                        </option>
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="rejected">
                                            Rejected
                                        </option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-content-secondary">
                                            From Date
                                        </label>

                                        <input
                                            type="date"
                                            name="from_date"
                                            value={draft.from_date}
                                            onChange={updateDraft}
                                            className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-content-secondary">
                                            To Date
                                        </label>

                                        <input
                                            type="date"
                                            name="to_date"
                                            value={draft.to_date}
                                            onChange={updateDraft}
                                            className="w-full rounded-xl border border-line-strong px-4 py-3 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-line px-5 py-4">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-strong px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-theme-surface-soft"
                                >
                                    <RotateCcw size={16} />
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                                >
                                    <Filter size={16} />
                                    Apply Filters
                                </button>
                            </div>
                        </form>
                    </aside>
                </div>
            )}
        </>
    );
};

export default PostFilter;
