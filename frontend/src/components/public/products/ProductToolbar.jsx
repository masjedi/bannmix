import { Search, SlidersHorizontal } from "lucide-react";

import { SEARCH_MAX_LENGTH, SORT_OPTIONS } from "./productUtils";

const fieldClassName =
    "theme-input mb-0 min-h-11 w-full rounded-xl px-3 text-sm focus-visible:outline-theme-focus-ring";

const ProductToolbar = ({
    resultLabel,
    searchLabel,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    categoryLabel,
    allCategoriesLabel,
    categories,
    categoryValue,
    onCategoryChange,
    sortLabel,
    sortValue,
    onSortChange,
    sortLabels,
}) => (
    <div className="products-toolbar rounded-[22px] p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <p
                className="shrink-0 text-sm font-semibold text-content lg:w-28"
                aria-live="polite"
            >
                {resultLabel}
            </p>

            <label className="relative mb-0 min-w-0 flex-1">
                <span className="sr-only">{searchLabel}</span>
                <Search
                    size={16}
                    className="search-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3"
                    aria-hidden="true"
                />
                <input
                    type="search"
                    value={searchValue}
                    maxLength={SEARCH_MAX_LENGTH}
                    onChange={(event) =>
                        onSearchChange(
                            event.target.value.slice(0, SEARCH_MAX_LENGTH)
                        )
                    }
                    placeholder={searchPlaceholder}
                    className="search-input h-11 w-full min-w-0 pl-10 pr-8 rtl:pl-8 rtl:pr-10"
                />
            </label>

            <div className="grid min-w-0 grid-cols-2 gap-3 lg:w-[26rem] lg:shrink-0">
                <label className="mb-0 min-w-0">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-content-muted lg:sr-only">
                        <SlidersHorizontal size={12} aria-hidden="true" />
                        {categoryLabel}
                    </span>
                    <select
                        value={categoryValue}
                        onChange={(event) =>
                            onCategoryChange(event.target.value)
                        }
                        aria-label={categoryLabel}
                        className={fieldClassName}
                    >
                        <option value="">{allCategoriesLabel}</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="mb-0 min-w-0">
                    <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-content-muted lg:sr-only">
                        {sortLabel}
                    </span>
                    <select
                        value={sortValue}
                        onChange={(event) => onSortChange(event.target.value)}
                        aria-label={sortLabel}
                        className={fieldClassName}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {sortLabels[option.value]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>

        {categories.length > 0 && (
            <div
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label={categoryLabel}
            >
                <button
                    type="button"
                    onClick={() => onCategoryChange("")}
                    className={[
                        "filter-chip min-h-11 shrink-0",
                        !categoryValue ? "is-active" : "",
                    ].join(" ")}
                >
                    {allCategoriesLabel}
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => onCategoryChange(category)}
                        className={[
                            "filter-chip min-h-11 shrink-0",
                            categoryValue === category ? "is-active" : "",
                        ].join(" ")}
                    >
                        {category}
                    </button>
                ))}
            </div>
        )}
    </div>
);

export default ProductToolbar;
