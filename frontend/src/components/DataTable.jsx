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
        <div className="data-table">
            {(title ||
                subtitle ||
                searchable ||
                headerActions ||
                showFilterButton ||
                onRefresh ||
                exportable ||
                printable) && (
                <div className="data-table-toolbar">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            {title ? (
                                <h2 className="data-table-title">{title}</h2>
                            ) : null}

                            {subtitle ? (
                                <p className="data-table-subtitle">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>

                        <div className="data-table-toolbar-actions">
                            {searchable ? (
                                <div className="data-table-search-wrap">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder={searchPlaceholder}
                                        className="data-table-search"
                                    />

                                    <Search
                                        size={16}
                                        className="data-table-search-icon"
                                    />
                                </div>
                            ) : null}

                            {showFilterButton ? (
                                <button
                                    type="button"
                                    onClick={onFilterClick}
                                    className="data-table-icon-btn"
                                    title="Filter"
                                >
                                    <Filter size={16} />
                                </button>
                            ) : null}

                            {onRefresh ? (
                                <button
                                    type="button"
                                    onClick={onRefresh}
                                    disabled={refreshLoading}
                                    className="data-table-icon-btn"
                                    title="Refresh"
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            refreshLoading ? "animate-spin" : ""
                                        }
                                    />
                                </button>
                            ) : null}

                            {exportable ? (
                                <button
                                    type="button"
                                    onClick={exportCsv}
                                    className="data-table-icon-btn"
                                    title="Export CSV"
                                >
                                    <FileDown size={16} />
                                </button>
                            ) : null}

                            {printable ? (
                                <button
                                    type="button"
                                    onClick={printTable}
                                    className="data-table-icon-btn"
                                    title="Print"
                                >
                                    <Printer size={16} />
                                </button>
                            ) : null}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsColumnMenuOpen(!isColumnMenuOpen)
                                    }
                                    className="data-table-menu-btn"
                                >
                                    <Columns size={16} />
                                    Column visibility
                                </button>

                                {isColumnMenuOpen ? (
                                    <div className="data-table-column-menu">
                                        {columns.map((column) => {
                                            const key = getColumnKey(column);

                                            return (
                                                <label
                                                    key={key}
                                                    className="data-table-column-option"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleColumnKeys.includes(
                                                            key
                                                        )}
                                                        onChange={() =>
                                                            toggleColumn(column)
                                                        }
                                                        className="data-table-checkbox"
                                                    />

                                                    {column.header}
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>

                            {headerActions}
                        </div>
                    </div>

                    {filters ? <div className="mt-3">{filters}</div> : null}
                </div>
            )}

            <div className="data-table-scroll">
                <table className="data-table-table theme-table">
                    <thead>
                        <tr>
                            {selectable ? (
                                <th className="w-10 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allPageRowsSelected}
                                        onChange={togglePageSelection}
                                        className="data-table-checkbox"
                                    />
                                </th>
                            ) : null}

                            {showIndex ? <th className="w-12 text-left">No</th> : null}

                            {visibleColumns.map((column) => {
                                const isSorted =
                                    sortConfig.key === column.accessor;

                                return (
                                    <th
                                        key={getColumnKey(column)}
                                        className={[
                                            column.align === "right"
                                                ? "text-right"
                                                : column.align === "center"
                                                  ? "text-center"
                                                  : "text-left",
                                            column.className || "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        <button
                                            type="button"
                                            disabled={
                                                column.sortable === false ||
                                                !column.accessor
                                            }
                                            onClick={() => handleSort(column)}
                                        >
                                            {column.header}

                                            {column.sortable !== false &&
                                            column.accessor ? (
                                                isSorted ? (
                                                    sortConfig.direction ===
                                                    "asc" ? (
                                                        <ArrowUp
                                                            size={12}
                                                            className="data-table-sort-active"
                                                        />
                                                    ) : (
                                                        <ArrowDown
                                                            size={12}
                                                            className="data-table-sort-active"
                                                        />
                                                    )
                                                ) : (
                                                    <ArrowUpDown size={12} />
                                                )
                                            ) : null}
                                        </button>
                                    </th>
                                );
                            })}

                            {actions ? (
                                <th className="w-28 text-right">Actions</th>
                            ) : null}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        (selectable ? 1 : 0) +
                                        (showIndex ? 1 : 0) +
                                        (actions ? 1 : 0)
                                    }
                                    className="data-table-loading"
                                >
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="data-table-loading-spinner" />

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
                                    className="data-table-empty"
                                >
                                    <div className="mx-auto flex max-w-sm flex-col items-center">
                                        <div className="data-table-empty-icon">
                                            📄
                                        </div>

                                        <p className="data-table-empty-title">
                                            {emptyText}
                                        </p>

                                        <p className="data-table-empty-copy">
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
                                        className={[
                                            "data-table-row",
                                            onRowClick ? "is-clickable" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {selectable ? (
                                            <td
                                                className="w-10"
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
                                                    className="data-table-checkbox"
                                                />
                                            </td>
                                        ) : null}

                                        {showIndex ? (
                                            <td className="w-12 data-table-index">
                                                {absoluteIndex}
                                            </td>
                                        ) : null}

                                        {visibleColumns.map((column) => (
                                            <td
                                                key={getColumnKey(column)}
                                                className={[
                                                    column.align === "right"
                                                        ? "text-right"
                                                        : column.align ===
                                                            "center"
                                                          ? "text-center"
                                                          : "text-left",
                                                    column.cellClassName || "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                            >
                                                {renderCell(
                                                    row,
                                                    column,
                                                    absoluteIndex
                                                )}
                                            </td>
                                        ))}

                                        {actions ? (
                                            <td
                                                className="text-right"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <div className="flex justify-end gap-2">
                                                    {actions(row)}
                                                </div>
                                            </td>
                                        ) : null}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {pagination ? (
                <div className="data-table-footer">
                    <div className="data-table-footer-meta">
                        {from}-{to} / {totalRecords}
                    </div>

                    <div className="data-table-footer-controls">
                        {!isServerPaginated || onPageSizeChange ? (
                            <div className="data-table-page-size">
                                <span className="data-table-page-size-label">
                                    Rows per page
                                </span>

                                <div className="data-table-select-wrap">
                                    <select
                                        value={activePageSize}
                                        onChange={handlePageSizeChange}
                                        className="data-table-select"
                                    >
                                        {pageSizeOptions.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>

                                    <ChevronDown
                                        size={15}
                                        className="data-table-select-icon"
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className="data-table-pagination">
                            <button
                                type="button"
                                disabled={activePage === 1}
                                onClick={() => goToPage(1)}
                                className="data-table-page-btn"
                            >
                                <ChevronsLeft size={16} />
                            </button>

                            <button
                                type="button"
                                disabled={activePage === 1}
                                onClick={() => goToPage(activePage - 1)}
                                className="data-table-page-btn"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span className="data-table-page-btn is-active">
                                {activePage}
                            </span>

                            <button
                                type="button"
                                disabled={activePage === totalPages}
                                onClick={() => goToPage(activePage + 1)}
                                className="data-table-page-btn"
                            >
                                <ChevronRight size={16} />
                            </button>

                            <button
                                type="button"
                                disabled={activePage === totalPages}
                                onClick={() => goToPage(totalPages)}
                                className="data-table-page-btn"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default DataTable;
