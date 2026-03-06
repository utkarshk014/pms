"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { DataGrid } from "@/components/grid/DataGrid";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { X } from "lucide-react";

interface SimpleEntity { id: string; name: string; isActive: boolean; }

interface SimpleMasterPageProps {
    title: string;
    breadcrumb: string[];
    entity: string;
    addLabel: string;
}

export function SimpleMasterPage({ title, breadcrumb, entity, addLabel }: SimpleMasterPageProps) {
    const [data, setData] = useState<SimpleEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [deleteModal, setDeleteModal] = useState<SimpleEntity | null>(null);
    const [name, setName] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function fetchData() {
        setLoading(true);
        const res = await fetch(`/api/masters/${entity}`);
        const json = await res.json();
        setData(json.data || []);
        setLoading(false);
    }
    useEffect(() => { fetchData(); }, [entity]);

    function openAdd() { setName(""); setEditId(null); setError(""); setModal("add"); }
    function openEdit(row: SimpleEntity) { setName(row.name); setEditId(row.id); setError(""); setModal("edit"); }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const url = modal === "edit" ? `/api/masters/${entity}/${editId}` : `/api/masters/${entity}`;
            const res = await fetch(url, { method: modal === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
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
        await fetch(`/api/masters/${entity}/${deleteModal.id}`, { method: "DELETE" });
        setDeleting(false);
        setDeleteModal(null);
        fetchData();
    }

    const columns = [
        { key: "name", label: "Name" },
        { key: "isActive", label: "Status", width: "80px", render: (v: boolean) => <span className={`badge ${v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{v ? "Active" : "Inactive"}</span> },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title={title} breadcrumb={breadcrumb} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <DataGrid columns={columns} data={data} loading={loading} onAdd={openAdd} addLabel={addLabel} onEdit={openEdit} onDelete={(row) => setDeleteModal(row)} />
            </div>

            {modal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "380px" }}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === "add" ? addLabel : `Edit ${title}`}</span>
                            <button onClick={() => setModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
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
