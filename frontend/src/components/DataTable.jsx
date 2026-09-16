import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Filter,
    RefreshCw,
    FileDown,
    Printer,
    Columns,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown,
} from "lucide-react";

const defaultPageSizeOptions = [10, 25, 50, 100];

const getNestedValue = (row, key) => {
    if (!key) return "";
    return key.split(".").reduce((value, part) => value?.[part], row);
};

const DataTable = ({
    title = "",
    subtitle = "",
    columns = [],
    data = [],
    loading = false,

    searchable = true,
    searchPlaceholder = "Search...",
    filters = null,
    showFilterButton = false,
    onFilterClick = null,

    onRefresh = null,
    refreshLoading = false,

    exportable = true,
    printable = true,

    selectable = false,
    selectedRows = [],
    onSelectedRowsChange = null,

    actions = null,
    headerActions = null,
    emptyText = "No records found.",
    rowKey = "id",

    pageSizeOptions = defaultPageSizeOptions,
    defaultPageSize = 25,
    showIndex = true,
    pagination = true,
    paginationMeta = null,
    onPageChange = null,
    onPageSizeChange = null,
    onRowClick = null,
}) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [sortConfig, setSortConfig] = useState({
        key: "",
        direction: "asc",
    });
    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
    const [visibleColumnKeys, setVisibleColumnKeys] = useState(() =>
        columns.map((column) => column.key || column.accessor || column.header)
    );

    const safeData = Array.isArray(data) ? data : [];

    const getColumnKey = (column) => {
        return column.key || column.accessor || column.header;
    };

    useEffect(() => {
        setSearch("");
        setPage(1);
        setSortConfig({
            key: "",
            direction: "asc",
        });
    }, [data]);

    useEffect(() => {
        const availableColumnKeys = columns.map((column) =>
            getColumnKey(column)
        );

        setVisibleColumnKeys((currentKeys) => {
            if (availableColumnKeys.length === 0) {
                return [];
            }

            const validCurrentKeys = currentKeys.filter((key) =>
                availableColumnKeys.includes(key)
            );

            const newKeys = availableColumnKeys.filter(
                (key) => !currentKeys.includes(key)
            );

            const nextKeys = [...validCurrentKeys, ...newKeys];

            return nextKeys.length > 0 ? nextKeys : availableColumnKeys;
        });
    }, [columns]);

    const visibleColumns = useMemo(() => {
        return columns.filter((column) =>
            visibleColumnKeys.includes(getColumnKey(column))
        );
    }, [columns, visibleColumnKeys]);

    const filteredData = useMemo(() => {
        if (!searchable || !search.trim()) {
            return safeData;
        }

        const query = search.trim().toLowerCase();

        return safeData.filter((row) =>
            columns.some((column) => {
                if (column.searchable === false) {
                    return false;
                }

                const value = column.accessor
                    ? getNestedValue(row, column.accessor)
                    : "";

                return String(value ?? "")
                    .toLowerCase()
                    .includes(query);
            })
        );
    }, [safeData, columns, search, searchable]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const aComparable =
                typeof aValue === "number"
                    ? aValue
                    : String(aValue).toLowerCase();

            const bComparable =
                typeof bValue === "number"
                    ? bValue
                    : String(bValue).toLowerCase();

            if (aComparable < bComparable) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }

            if (aComparable > bComparable) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }

            return 0;
        });
    }, [filteredData, sortConfig]);

    const isServerPaginated = Boolean(paginationMeta && onPageChange);
    const activePage = isServerPaginated
        ? Number(paginationMeta.current_page) || 1
        : page;
    const activePageSize = isServerPaginated
        ? Number(paginationMeta.per_page) || defaultPageSize
        : pageSize;
    const totalPages = isServerPaginated
        ? Math.max(1, Number(paginationMeta.last_page) || 1)
        : Math.max(1, Math.ceil(sortedData.length / pageSize));

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, totalPages));
    }, [totalPages]);

    const paginatedData = useMemo(() => {
        if (!pagination || isServerPaginated) {
            return sortedData;
        }

        const start = (page - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, page, pageSize, pagination, isServerPaginated]);

    const from = isServerPaginated
        ? Number(paginationMeta.from) || 0
        : sortedData.length === 0
          ? 0
          : (page - 1) * pageSize + 1;
    const to = isServerPaginated
        ? Number(paginationMeta.to) || 0
        : Math.min(page * pageSize, sortedData.length);
    const totalRecords = isServerPaginated
        ? Number(paginationMeta.total) || 0
        : sortedData.length;

    const selectedKeys = useMemo(() => {
        return selectedRows.map((row) => row[rowKey]);
    }, [selectedRows, rowKey]);

    const allPageRowsSelected =
        paginatedData.length > 0 &&
        paginatedData.every((row) => selectedKeys.includes(row[rowKey]));

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(1);
    };

    const handlePageSizeChange = (event) => {
        const nextPageSize = Number(event.target.value);

        if (isServerPaginated) {
            onPageSizeChange?.(nextPageSize);
            return;
        }

        setPageSize(nextPageSize);
        setPage(1);
    };

    const goToPage = (nextPage) => {
        const resolvedPage = Math.min(
            totalPages,
            Math.max(1, Number(nextPage) || 1)
        );

        if (isServerPaginated) {
            onPageChange(resolvedPage);
            return;
        }

        setPage(resolvedPage);
    };

    const handleSort = (column) => {
        if (column.sortable === false || !column.accessor) return;

        setSortConfig((previous) => ({
            key: column.accessor,
            direction:
                previous.key === column.accessor && previous.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    const toggleColumn = (column) => {
        const key = getColumnKey(column);

        setVisibleColumnKeys((previous) => {
            if (previous.includes(key)) {
                if (previous.length === 1) return previous;
                return previous.filter((item) => item !== key);
            }

            return [...previous, key];
        });
    };

    const toggleRowSelection = (row) => {
        if (!onSelectedRowsChange) return;

        const key = row[rowKey];
        const exists = selectedKeys.includes(key);

        if (exists) {
            onSelectedRowsChange(
                selectedRows.filter((item) => item[rowKey] !== key)
            );
        } else {
            onSelectedRowsChange([...selectedRows, row]);
        }
    };

    const togglePageSelection = () => {
        if (!onSelectedRowsChange) return;

        if (allPageRowsSelected) {
            const pageKeys = paginatedData.map((row) => row[rowKey]);

            onSelectedRowsChange(
                selectedRows.filter((row) => !pageKeys.includes(row[rowKey]))
            );

            return;
        }

        const newRows = paginatedData.filter(
            (row) => !selectedKeys.includes(row[rowKey])
        );

        onSelectedRowsChange([...selectedRows, ...newRows]);
    };

    const renderCell = (row, column, rowIndex) => {
        if (column.render) {
            return column.render(row, rowIndex);
        }

        const value = getNestedValue(row, column.accessor);

        if (value === null || value === undefined || value === "") {
            return <span className="text-content-muted">—</span>;
        }

        return value;
    };

    const exportCsv = () => {
        const headers = [
            ...(showIndex ? ["No"] : []),
            ...visibleColumns.map((column) => column.header),
        ];

        const rows = sortedData.map((row, index) => [
            ...(showIndex ? [`${index + 1}`] : []),
            ...visibleColumns.map((column) => {
                const value = column.accessor
                    ? getNestedValue(row, column.accessor)
                    : "";

                return `"${String(value ?? "").replaceAll('"', '""')}"`;
            }),
        ]);

        const csv = [headers.join(","), ...rows.map((row) => row.join(","))]
            .join("\n")
            .trim();

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${title || "datatable"}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const printTable = () => {
        const printWindow = window.open("", "_blank");

        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>${title || "DataTable"}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; }
                        h1 { font-size: 18px; margin-bottom: 4px; }
                        p { color: #64748b; margin-top: 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                        th { background: #f8fafc; text-transform: uppercase; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <h1>${title || "DataTable"}</h1>
                    ${subtitle ? `<p>${subtitle}</p>` : ""}
                    <table>
                        <thead>
                            <tr>
                                ${showIndex ? "<th>No</th>" : ""}
                                ${visibleColumns
                                    .map(
                                        (column) => `<th>${column.header}</th>`
                                    )
                                    .join("")}
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedData
                                .map(
                                    (row, index) => `
                                        <tr>
                                            ${
                                                showIndex
                                                    ? `<td>${index + 1}</td>`
                                                    : ""
                                            }
                                            ${visibleColumns
                                                .map((column) => {
                                                    const value =
                                                        column.accessor
                                                            ? getNestedValue(
                                                                  row,
                                                                  column.accessor
                                                              )
                                                            : "";

                                                    return `<td>${
                                                        value ?? ""
                                                    }</td>`;
                                                })
                                                .join("")}
                                        </tr>
                                    `
                                )
                                .join("")}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="overflow-hidden rounded-xl border border-line bg-theme-surface shadow-sm">
            {(title ||
                subtitle ||
                searchable ||
                headerActions ||
                showFilterButton ||
                onRefresh ||
                exportable ||
                printable) && (
                <div className="border-b border-line bg-theme-surface px-3 py-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            {title && (
                                <h2 className="text-base font-semibold text-content">
                                    {title}
                                </h2>
                            )}

                            {subtitle && (
                                <p className="mt-1 text-sm text-content-muted">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap lg:justify-end">
                            {searchable && (
                                <div className="relative h-10 min-w-0 flex-1 lg:w-72 lg:flex-none">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder={searchPlaceholder}
                                        className="block h-10 w-full rounded-lg border border-line-strong bg-theme-surface pl-3 pr-10 text-sm text-content-secondary outline-none transition placeholder:text-content-muted focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                                    />

                                    <Search
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
                                    />
                                </div>
                            )}

                            {showFilterButton && (
                                <button
                                    type="button"
                                    onClick={onFilterClick}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-content-secondary transition hover:bg-theme-page"
                                    title="Filter"
                                >
                                    <Filter size={16} />
                                </button>
                            )}

                            {onRefresh && (
                                <button
                                    type="button"
                                    onClick={onRefresh}
                                    disabled={refreshLoading}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-content-secondary transition hover:bg-theme-page disabled:opacity-50"
                                    title="Refresh"
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            refreshLoading ? "animate-spin" : ""
                                        }
                                    />
                                </button>
                            )}

                            {exportable && (
                                <button
                                    type="button"
                                    onClick={exportCsv}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-content-secondary transition hover:bg-theme-page"
                                    title="Export CSV"
                                >
                                    <FileDown size={16} />
                                </button>
                            )}

                            {printable && (
                                <button
                                    type="button"
                                    onClick={printTable}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-content-secondary transition hover:bg-theme-page"
                                    title="Print"
                                >
                                    <Printer size={16} />
                                </button>
                            )}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsColumnMenuOpen(!isColumnMenuOpen)
                                    }
                                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line-strong px-3 text-sm font-semibold text-content-secondary transition hover:bg-theme-page"
                                >
                                    <Columns size={16} />
                                    Column visibility
                                </button>

                                {isColumnMenuOpen && (
                                    <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-line bg-theme-surface p-2 shadow-xl">
                                        {columns.map((column) => {
                                            const key = getColumnKey(column);

                                            return (
                                                <label
                                                    key={key}
                                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-content-secondary hover:bg-theme-page"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleColumnKeys.includes(
                                                            key
                                                        )}
                                                        onChange={() =>
                                                            toggleColumn(column)
                                                        }
                                                        className="h-4 w-4 rounded border-line-strong text-green-600 focus:ring-green-500"
                                                    />

                                                    {column.header}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {headerActions}
                        </div>
                    </div>

                    {filters && <div className="mt-3">{filters}</div>}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-theme-page">
                        <tr>
                            {selectable && (
                                <th className="w-10 px-2 py-2.5 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allPageRowsSelected}
                                        onChange={togglePageSelection}
                                        className="h-4 w-4 rounded border-line-strong text-green-600 focus:ring-green-500"
                                    />
                                </th>
                            )}

                            {showIndex && (
                                <th className="w-12 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                                    No
                                </th>
                            )}

                            {visibleColumns.map((column) => {
                                const isSorted =
                                    sortConfig.key === column.accessor;

                                return (
                                    <th
                                        key={getColumnKey(column)}
                                        className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-content-muted ${
                                            column.align === "right"
                                                ? "text-right"
                                                : column.align === "center"
                                                ? "text-center"
                                                : "text-left"
                                        } ${column.className || ""}`}
                                    >
                                        <button
                                            type="button"
                                            disabled={
                                                column.sortable === false ||
                                                !column.accessor
                                            }
                                            onClick={() => handleSort(column)}
                                            className="inline-flex items-center gap-1 disabled:cursor-default"
                                        >
                                            {column.header}

                                            {column.sortable !== false &&
                                                column.accessor &&
                                                (isSorted ? (
                                                    sortConfig.direction ===
                                                    "asc" ? (
                                                        <ArrowUp
                                                            size={12}
                                                            className="text-green-600"
                                                        />
                                                    ) : (
                                                        <ArrowDown
                                                            size={12}
                                                            className="text-green-600"
                                                        />
                                                    )
                                                ) : (
                                                    <ArrowUpDown
                                                        size={12}
                                                        className="text-content-muted"
                                                    />
                                                ))}
                                        </button>
                                    </th>
                                );
                            })}

                            {actions && (
                                <th className="w-28 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-content-muted">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-line bg-theme-surface">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        (selectable ? 1 : 0) +
                                        (showIndex ? 1 : 0) +
                                        (actions ? 1 : 0)
                                    }
                                    className="px-3 py-10 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-green-600" />

                                        <p className="text-sm text-content-muted">
                                            Loading records...
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        (selectable ? 1 : 0) +
                                        (showIndex ? 1 : 0) +
                                        (actions ? 1 : 0)
                                    }
                                    className="px-3 py-10 text-center"
                                >
                                    <div className="mx-auto flex max-w-sm flex-col items-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-theme-surface-soft text-xl">
                                            📄
                                        </div>

                                        <p className="font-medium text-content-secondary">
                                            {emptyText}
                                        </p>

                                        <p className="mt-1 text-sm text-content-muted">
                                            Try changing your search or filters.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => {
                                const absoluteIndex = isServerPaginated
                                    ? Math.max(1, from) + rowIndex
                                    : (page - 1) * pageSize + rowIndex + 1;
                                const isSelected = selectedKeys.includes(
                                    row[rowKey]
                                );

                                return (
                                    <tr
                                        key={row[rowKey] || absoluteIndex}
                                        onClick={() => onRowClick?.(row)}
                                        className={`transition hover:bg-green-50/40 ${
                                            onRowClick ? "cursor-pointer" : ""
                                        }`}
                                    >
                                        {selectable && (
                                            <td
                                                className="w-10 px-2 py-3"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        toggleRowSelection(row)
                                                    }
                                                    className="h-4 w-4 rounded border-line-strong text-green-600 focus:ring-green-500"
                                                />
                                            </td>
                                        )}

                                        {showIndex && (
                                            <td className="w-12 px-3 py-3 text-sm font-semibold text-content-muted">
                                                {absoluteIndex}
                                            </td>
                                        )}

                                        {visibleColumns.map((column) => (
                                            <td
                                                key={getColumnKey(column)}
                                                className={`px-3 py-3 text-content-secondary ${
                                                    column.align === "right"
                                                        ? "text-right"
                                                        : column.align ===
                                                          "center"
                                                        ? "text-center"
                                                        : "text-left"
                                                } ${
                                                    column.cellClassName || ""
                                                }`}
                                            >
                                                {renderCell(
                                                    row,
                                                    column,
                                                    absoluteIndex
                                                )}
                                            </td>
                                        ))}

                                        {actions && (
                                            <td
                                                className="px-3 py-3 text-right"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <div className="flex justify-end gap-2">
                                                    {actions(row)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="flex flex-col gap-3 border-t border-line px-3 py-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-content-muted">
                    {from}-{to} / {totalRecords}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    {(!isServerPaginated || onPageSizeChange) && (
                        <div className="flex h-10 shrink-0 items-center gap-2">
                        <span className="whitespace-nowrap text-sm leading-none text-content-secondary">
                            Rows per page
                        </span>

                        <div className="relative h-10">
                            <select
                                value={activePageSize}
                                onChange={handlePageSizeChange}
                                className="h-10 min-w-[76px] appearance-none rounded-lg border border-line-strong bg-theme-surface py-0 pl-3 pr-9 text-sm leading-none text-content-secondary outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown
                                size={15}
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
                            />
                        </div>
                        </div>
                    )}

                    <div className="flex h-10 items-center gap-1">
                        <button
                            type="button"
                            disabled={activePage === 1}
                            onClick={() => goToPage(1)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-content-secondary transition hover:bg-theme-page disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronsLeft size={16} />
                        </button>

                        <button
                            type="button"
                            disabled={activePage === 1}
                            onClick={() => goToPage(activePage - 1)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-content-secondary transition hover:bg-theme-page disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-green-600 px-3 text-sm font-semibold text-white">
                            {activePage}
                        </span>

                        <button
                            type="button"
                            disabled={activePage === totalPages}
                            onClick={() => goToPage(activePage + 1)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-content-secondary transition hover:bg-theme-page disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={16} />
                        </button>

                        <button
                            type="button"
                            disabled={activePage === totalPages}
                            onClick={() => goToPage(totalPages)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong text-content-secondary transition hover:bg-theme-page disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
