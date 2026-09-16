import { ChevronLeft, ChevronRight } from "lucide-react";

import { getVisiblePages } from "./productUtils";

const ProductPagination = ({
    page,
    totalPages,
    onPageChange,
    previousLabel,
    nextLabel,
    paginationLabel,
}) => {
    if (totalPages <= 1) return null;

    const pages = getVisiblePages(page, totalPages);

    return (
        <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label={paginationLabel}
        >
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="pagination-btn gap-1 px-3"
            >
                <ChevronLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
                <span className="ms-1 hidden sm:inline">{previousLabel}</span>
            </button>

            {pages.map((item) =>
                typeof item === "string" ? (
                    <span
                        key={item}
                        className="min-w-8 text-center text-sm text-content-muted"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange(item)}
                        aria-current={item === page ? "page" : undefined}
                        className={[
                            "pagination-btn",
                            item === page ? "is-active" : "",
                        ].join(" ")}
                    >
                        {item}
                    </button>
                )
            )}

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="pagination-btn gap-1 px-3"
            >
                <span className="me-1 hidden sm:inline">{nextLabel}</span>
                <ChevronRight size={16} className="rtl:rotate-180" aria-hidden="true" />
            </button>
        </nav>
    );
};

export default ProductPagination;
