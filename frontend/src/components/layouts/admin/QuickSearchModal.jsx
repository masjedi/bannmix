import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Package, Search, X } from "lucide-react";

import Modal from "../../Modal";
import { QUICK_SEARCH_PAGES } from "./adminLayoutConfig";
import {
    getPostContent,
    includesSearch,
} from "./adminLayoutUtils";

const QuickSearchResult = ({ result, active, onSelect, onHover }) => {
    const Icon = result.icon;

    return (
        <button
            type="button"
            onClick={() => onSelect(result)}
            onMouseEnter={onHover}
            className={[
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                active
                    ? "bg-theme-page text-white"
                    : "text-content-secondary hover:bg-theme-surface-soft",
            ].join(" ")}
        >
            <span
                className={[
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    active
                        ? "bg-theme-surface/10 text-theme-success-text"
                        : result.tone === "amber"
                        ? "bg-brand-orange/10 text-brand-orange"
                        : "bg-theme-success-bg text-theme-success-text",
                ].join(" ")}
            >
                <Icon size={15} />
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{result.title}</p>
                <p
                    className={[
                        "mt-0.5 truncate text-xs",
                        active ? "text-content-muted" : "text-content-muted",
                    ].join(" ")}
                >
                    {result.subtitle}
                </p>
            </div>

            <ChevronRight
                size={14}
                className={active ? "text-content-muted" : "text-content-muted"}
            />
        </button>
    );
};

const QuickSearchModal = ({
    open,
    onClose,
    loading,
    error,
    posts = [],
    onNavigate,
}) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setSelectedIndex(0);
            return undefined;
        }

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => {
            window.clearTimeout(timer);
        };
    }, [open]);

    const resultGroups = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        const pageResults = QUICK_SEARCH_PAGES.filter((page) => {
            if (!normalizedQuery) {
                return true;
            }

            return includesSearch(
                [page.title, page.subtitle, page.keywords],
                normalizedQuery
            );
        }).map((page) => ({
            ...page,
            type: "page",
            tone: "emerald",
        }));

        const postResults = posts
            .filter((post) => {
                if (!normalizedQuery) {
                    return false;
                }

                return includesSearch(
                    [
                        post.id,
                        post.title,
                        getPostContent(post),
                        post.category,
                        post.brand,
                        post.sku,
                        post.status,
                    ],
                    normalizedQuery
                );
            })
            .slice(0, 6)
            .map((post) => ({
                key: `post-${post.id}`,
                type: "post",
                title: post.title || `Product #${post.id}`,
                subtitle: post.status || "Unknown status",
                path: `/admin/posts/${post.id}`,
                icon: Package,
                tone: "amber",
            }));

        return [
            {
                key: "pages",
                label: "Admin Pages",
                results: pageResults,
            },
            {
                key: "posts",
                label: "Products",
                results: postResults,
            },
        ].filter((group) => group.results.length > 0);
    }, [query, posts]);

    const flatResults = useMemo(
        () => resultGroups.flatMap((group) => group.results),
        [resultGroups]
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (selectedIndex >= flatResults.length) {
            setSelectedIndex(Math.max(0, flatResults.length - 1));
        }
    }, [flatResults.length, selectedIndex]);

    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((current) =>
                flatResults.length === 0
                    ? 0
                    : (current + 1) % flatResults.length
            );
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((current) =>
                flatResults.length === 0
                    ? 0
                    : (current - 1 + flatResults.length) % flatResults.length
            );
            return;
        }

        if (event.key === "Enter" && flatResults[selectedIndex]) {
            event.preventDefault();
            onNavigate(flatResults[selectedIndex].path);
        }
    };

    let runningIndex = 0;

    return (
        <Modal open={open} title="Quick Search" size="lg" onClose={onClose}>
            <div className="space-y-4">
                <div className="relative">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted"
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search pages or products..."
                        className="h-12 w-full rounded-xl border border-line-strong bg-theme-surface pl-11 pr-12 text-sm text-content outline-none transition placeholder:text-content-muted focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-content-muted transition hover:bg-theme-surface-soft hover:text-content-secondary"
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {error && (
                    <div className="rounded-lg border border-brand-orange/25 bg-brand-orange/10 px-3 py-2 text-xs text-brand-orange">
                        Some live search data could not be loaded. Page search
                        is still available.
                    </div>
                )}

                <div className="max-h-[55vh] overflow-y-auto pr-1">
                    {loading && flatResults.length === 0 ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2.5"
                                >
                                    <span className="h-9 w-9 rounded-lg bg-theme-surface-soft" />
                                    <div className="flex-1">
                                        <div className="h-3 w-1/3 rounded bg-theme-surface-soft" />
                                        <div className="mt-2 h-2.5 w-2/3 rounded bg-theme-surface-soft" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : resultGroups.length > 0 ? (
                        <div className="space-y-4">
                            {resultGroups.map((group) => (
                                <section key={group.key}>
                                    <div className="mb-1 flex items-center justify-between px-2">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                                            {group.label}
                                        </p>
                                        <span className="text-[10px] font-semibold text-content-muted">
                                            {group.results.length}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {group.results.map((result) => {
                                            const resultIndex = runningIndex;
                                            runningIndex += 1;

                                            return (
                                                <QuickSearchResult
                                                    key={result.key}
                                                    result={result}
                                                    active={
                                                        selectedIndex ===
                                                        resultIndex
                                                    }
                                                    onSelect={() =>
                                                        onNavigate(result.path)
                                                    }
                                                    onHover={() =>
                                                        setSelectedIndex(
                                                            resultIndex
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-line bg-theme-page px-5 py-10 text-center">
                            <Search
                                size={22}
                                className="mx-auto text-content-muted"
                            />
                            <p className="mt-3 text-sm font-semibold text-content-secondary">
                                No results found
                            </p>
                            <p className="mt-1 text-xs text-content-muted">
                                Try a product name, status, SKU, or page name.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[10px] font-semibold text-content-muted">
                    <span>Use ↑ ↓ to move and Enter to open</span>
                    <span>Esc to close</span>
                </div>
            </div>
        </Modal>
    );
};

export default QuickSearchModal;
