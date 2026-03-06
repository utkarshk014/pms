"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { DataGrid } from "@/components/grid/DataGrid";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StockItem {
    id: string;
    code: string;
    name: string;
    uom: string;
    currentQty: number;
    minLevel: number;
    reorderLevel: number;
    category?: { name: string };
    group?: { name: string };
    manufacturer?: { name: string };
    lastPurchaseRate: number;
}

interface SelectOption { id: string; name: string; }

const emptyForm: any = { code: "", name: "", categoryId: "", groupId: "", manufacturerId: "", uom: "Nos", openingQty: "0", minLevel: "0", reorderLevel: "0" };

export default function StockItemsPage() {
    const [data, setData] = useState<StockItem[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [groups, setGroups] = useState<SelectOption[]>([]);
    const [manufacturers, setManufacturers] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [deleteModal, setDeleteModal] = useState<StockItem | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function fetchData() {
        setLoading(true);
        const [items, cats, grps, mfrs] = await Promise.all([
            fetch("/api/masters/stock-items").then(r => r.json()),
            fetch("/api/masters/stock-categories").then(r => r.json()),
            fetch("/api/masters/stock-groups").then(r => r.json()),
            fetch("/api/masters/manufacturers").then(r => r.json()),
        ]);
        setData(items.items || []);
        setCategories(cats.data || []);
        setGroups(grps.data || []);
        setManufacturers(mfrs.data || []);
        setLoading(false);
    }

    useEffect(() => { fetchData(); }, []);

    function openAdd() { setForm(emptyForm); setEditId(null); setError(""); setModal("add"); }
    function openEdit(row: StockItem) {
        setForm({ code: row.code, name: row.name, categoryId: "", groupId: "", manufacturerId: "", uom: row.uom, openingQty: "0", minLevel: String(row.minLevel), reorderLevel: String(row.reorderLevel) });
        setEditId(row.id);
        setModal("edit");
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const url = modal === "edit" ? `/api/masters/stock-items/${editId}` : "/api/masters/stock-items";
            const res = await fetch(url, { method: modal === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const json = await res.json();
            if (!res.ok) { setError(json.error || "Failed to save"); return; }
            setModal(null);
            fetchData();
        } catch { setError("Network error"); }
        finally { setSaving(false); }
    }

    async function handleDelete() {
        if (!deleteModal) return;
        setDeleting(true);
        await fetch(`/api/masters/stock-items/${deleteModal.id}`, { method: "DELETE" });
        setDeleting(false);
        setDeleteModal(null);
        fetchData();
    }

    const columns = [
        { key: "code", label: "Code", width: "90px" },
        { key: "name", label: "Item Name" },
        { key: "category", label: "Category", width: "110px", render: (_: any, row: StockItem) => row.category?.name || "-" },
        { key: "uom", label: "UOM", width: "60px" },
        { key: "currentQty", label: "Stock Qty", width: "80px", render: (v: number) => <strong>{v}</strong> },
        { key: "minLevel", label: "Min Level", width: "80px" },
        { key: "reorderLevel", label: "Reorder", width: "80px" },
        { key: "lastPurchaseRate", label: "Last Rate", width: "100px", render: (v: number) => v ? formatCurrency(v) : "-" },
        {
            key: "stockAlert", label: "Alert", width: "70px", sortable: false,
            render: (qty: number, row: StockItem) => qty <= row.minLevel ? (
                <span className="badge bg-red-100 text-red-700">LOW</span>
            ) : null
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Stock Items" breadcrumb={["Masters", "Stock Items"]} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <DataGrid columns={columns} data={data} loading={loading} onAdd={openAdd} addLabel="Add Item" onEdit={openEdit} onDelete={(row) => setDeleteModal(row)} searchPlaceholder="Search items..." />
            </div>

            {modal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "540px" }}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === "add" ? "Add Stock Item" : "Edit Stock Item"}</span>
                            <button onClick={() => setModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="form-group">
                                        <label className="form-label">Item Code *</label>
                                        <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required disabled={modal === "edit"} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">UOM *</label>
                                        <select className="form-input" value={form.uom} onChange={e => setForm({ ...form, uom: e.target.value })}>
                                            <option>Nos</option><option>Kg</option><option>Ltrs</option><option>Mtr</option><option>Box</option><option>Set</option><option>Pair</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Item Name *</label>
                                        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                            <option value="">-- Select --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Group</label>
                                        <select className="form-input" value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })}>
                                            <option value="">-- Select --</option>
                                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Manufacturer</label>
                                        <select className="form-input" value={form.manufacturerId} onChange={e => setForm({ ...form, manufacturerId: e.target.value })}>
                                            <option value="">-- Select --</option>
                                            {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    {modal === "add" && (
                                        <div className="form-group">
                                            <label className="form-label">Opening Qty</label>
                                            <input type="number" className="form-input" value={form.openingQty} onChange={e => setForm({ ...form, openingQty: e.target.value })} min="0" />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">Min Level</label>
                                        <input type="number" className="form-input" value={form.minLevel} onChange={e => setForm({ ...form, minLevel: e.target.value })} min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Reorder Level</label>
                                        <input type="number" className="form-input" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} min="0" />
                                    </div>
                                </div>
                                {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px" }}>{error}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <DeleteConfirmModal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} itemName={deleteModal?.name} loading={deleting} />
        </div>
    );
}
