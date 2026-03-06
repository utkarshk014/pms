"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { DataGrid } from "@/components/grid/DataGrid";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { X } from "lucide-react";

interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    mobile: string;
    email: string;
    gstNo: string;
    vendorType: string;
    isActive: boolean;
}

const emptyForm = { name: "", address: "", contactPerson: "", mobile: "", email: "", gstNo: "", panNo: "", vendorType: "GOODS" };

export default function VendorsPage() {
    const [data, setData] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [deleteModal, setDeleteModal] = useState<Vendor | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function fetchData() {
        setLoading(true);
        const res = await fetch("/api/masters/vendors");
        const json = await res.json();
        setData(json.vendors || []);
        setLoading(false);
    }

    useEffect(() => { fetchData(); }, []);

    function openAdd() { setForm(emptyForm); setEditId(null); setError(""); setModal("add"); }
    function openEdit(row: Vendor) {
        setForm({ name: row.name, address: "", contactPerson: row.contactPerson || "", mobile: row.mobile || "", email: row.email || "", gstNo: row.gstNo || "", panNo: "", vendorType: row.vendorType || "GOODS" });
        setEditId(row.id);
        setError("");
        setModal("edit");
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const url = modal === "edit" ? `/api/masters/vendors/${editId}` : "/api/masters/vendors";
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
        await fetch(`/api/masters/vendors/${deleteModal.id}`, { method: "DELETE" });
        setDeleting(false);
        setDeleteModal(null);
        fetchData();
    }

    const columns = [
        { key: "name", label: "Vendor Name" },
        { key: "contactPerson", label: "Contact Person", width: "140px" },
        { key: "mobile", label: "Mobile", width: "120px" },
        { key: "email", label: "Email" },
        { key: "gstNo", label: "GST No", width: "140px" },
        { key: "vendorType", label: "Type", width: "80px" },
        { key: "isActive", label: "Status", width: "80px", render: (val: boolean) => <span className={`badge ${val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{val ? "Active" : "Inactive"}</span> },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Vendors" breadcrumb={["Masters", "Vendors"]} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <DataGrid columns={columns} data={data} loading={loading} onAdd={openAdd} addLabel="Add Vendor" onEdit={openEdit} onDelete={(row) => setDeleteModal(row)} searchPlaceholder="Search vendors..." />
            </div>

            {modal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "520px" }}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === "add" ? "Add Vendor" : "Edit Vendor"}</span>
                            <button onClick={() => setModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Vendor Name *</label>
                                        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Contact Person</label>
                                        <input className="form-input" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mobile</label>
                                        <input className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} maxLength={10} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vendor Type</label>
                                        <select className="form-input" value={form.vendorType} onChange={e => setForm({ ...form, vendorType: e.target.value })}>
                                            <option value="GOODS">Goods</option>
                                            <option value="SERVICES">Services</option>
                                            <option value="BOTH">Both</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GST Number</label>
                                        <input className="form-input" value={form.gstNo} onChange={e => setForm({ ...form, gstNo: e.target.value })} placeholder="22AAAAA0000A1Z5" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">PAN Number</label>
                                        <input className="form-input" value={form.panNo} onChange={e => setForm({ ...form, panNo: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Address</label>
                                        <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
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
