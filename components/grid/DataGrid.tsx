"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: any, row: T) => React.ReactNode;
}

export interface DataGridProps<T = any> {
    columns: Column<T>[];
    data: T[];
    title?: string;
    onAdd?: () => void;
    addLabel?: string;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    extraActions?: (row: T) => React.ReactNode;
    loading?: boolean;
    rowKey?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    toolbar?: React.ReactNode;
}

type SortDirection = "asc" | "desc" | null;

export function DataGrid<T extends Record<string, any>>({
    columns,
    data,
    title,
    onAdd,
    addLabel = "Add New",
    onEdit,
    onDelete,
    onView,
    extraActions,
    loading = false,
    rowKey = "id",
    searchable = true,
    searchPlaceholder = "Search...",
    emptyMessage = "No records found",
    toolbar,
}: DataGridProps<T>) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDirection>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    const hasActions = onEdit || onDelete || onView || extraActions;

    // Filter
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter((row) =>
            Object.values(row).some((val) => String(val || "").toLowerCase().includes(q))
        );
    }, [data, search]);

    // Sort
    const sorted = useMemo(() => {
        if (!sortKey || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (av === null || av === undefined) return 1;
            if (bv === null || bv === undefined) return -1;
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleSort(key: string) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
            if (sortDir === "desc") setSortKey(null);
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    function SortIcon({ colKey }: { colKey: string }) {
        if (sortKey !== colKey) return <ChevronsUpDown size={11} className="text-gray-400 ml-1" />;
        if (sortDir === "asc") return <ChevronUp size={11} className="text-blue-600 ml-1" />;
        if (sortDir === "desc") return <ChevronDown size={11} className="text-blue-600 ml-1" />;
        return <ChevronsUpDown size={11} className="text-gray-400 ml-1" />;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Toolbar */}
            <div className="toolbar" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {onAdd && (
                        <button className="btn btn-primary btn-sm" onClick={onAdd} id="btn-add-new">
                            <Plus size={13} />
                            {addLabel}
                        </button>
                    )}
                    {toolbar}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {searchable && (
                        <div style={{ position: "relative" }}>
                            <Search size={13} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                            <input
                                type="text"
                                className="form-input"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder={searchPlaceholder}
                                style={{ paddingLeft: "28px", width: "200px" }}
                                id="grid-search"
                            />
                        </div>
                    )}
                    <span style={{ fontSize: "11px", color: "#6b7280", whiteSpace: "nowrap" }}>
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflow: "auto" }}>
                <table className="erp-table">
                    <thead>
                        <tr>
                            <th style={{ width: "40px", textAlign: "center" }}>#</th>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                >
                                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                                        {col.label}
                                        {col.sortable !== false && <SortIcon colKey={col.key} />}
                                    </span>
                                </th>
                            ))}
                            {hasActions && <th style={{ width: "120px", textAlign: "center" }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (hasActions ? 2 : 1)} style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (hasActions ? 2 : 1)} style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, idx) => (
                                <tr key={row[rowKey] || idx}>
                                    <td style={{ textAlign: "center", color: "#9ca3af", fontSize: "11px" }}>
                                        {(page - 1) * PAGE_SIZE + idx + 1}
                                    </td>
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "-")}
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td style={{ textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                                {onView && (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => onView(row)} id={`btn-view-${row[rowKey]}`}>
                                                        View
                                                    </button>
                                                )}
                                                {onEdit && (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(row)} id={`btn-edit-${row[rowKey]}`}>
                                                        Edit
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(row)} id={`btn-delete-${row[rowKey]}`}>
                                                        Del
                                                    </button>
                                                )}
                                                {extraActions && extraActions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", padding: "8px 14px", borderTop: "1px solid #e5e7eb", background: "#f8fafc" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                    <span style={{ fontSize: "12px", color: "#374151" }}>Page {page} of {totalPages}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                </div>
            )}
        </div>
    );
}
