"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { DataGrid } from "@/components/grid/DataGrid";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { ExcelUploadModal } from "@/components/ui/ExcelUploadModal";
import { X, Upload } from "lucide-react";

interface Subsidiary {
    id: string;
    code: string;
    name: string;
    city: string;
    state: string;
    mobile: string;
    email: string;
    isActive: boolean;
}

const emptyForm = { code: "", name: "", address: "", city: "", state: "", mobile: "", email: "", isActive: true };

export default function SubsidiariesPage() {
    const [data, setData] = useState<Subsidiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [showExcelUpload, setShowExcelUpload] = useState(false);
    const [deleteModal, setDeleteModal] = useState<Subsidiary | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function fetchData() {
        setLoading(true);
        const res = await fetch("/api/masters/subsidiaries");
        const json = await res.json();
        setData(json.subsidiaries || []);
        setLoading(false);
    }

    useEffect(() => { fetchData(); }, []);

    function openAdd() { setForm(emptyForm); setEditId(null); setError(""); setModal("add"); }
    function openEdit(row: Subsidiary) {
        setForm({ code: row.code, name: row.name, address: "", city: row.city || "", state: row.state || "", mobile: row.mobile, email: row.email || "", isActive: row.isActive });
        setEditId(row.id);
        setError("");
        setModal("edit");
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const url = modal === "edit" ? `/api/masters/subsidiaries/${editId}` : "/api/masters/subsidiaries";
            const method = modal === "edit" ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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
        await fetch(`/api/masters/subsidiaries/${deleteModal.id}`, { method: "DELETE" });
        setDeleting(false);
        setDeleteModal(null);
        fetchData();
    }

    async function handleExcelUpload(parsedData: any[]) {
        try {
            const res = await fetch("/api/masters/subsidiaries/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsedData)
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || "Upload failed");
            }
            if (json.errors && json.errors.length > 0) {
                alert(`Upload complete.\n\n${json.successCount} added.\n${json.failCount} failed.\n\nErrors:\n- ${json.errors.slice(0, 5).join("\n- ")}${json.errors.length > 5 ? "\n...and more" : ""}`);
            } else {
                alert(`Successfully added ${json.successCount} subsidiaries!`);
            }
            setShowExcelUpload(false);
            fetchData();
        } catch (err: any) {
            throw new Error(err.message || "Failed to save bulk data");
        }
    }

    const columns = [
        { key: "code", label: "Code", width: "100px" },
        { key: "name", label: "Institution Name" },
        { key: "city", label: "City", width: "120px" },
        { key: "state", label: "State", width: "120px" },
        { key: "mobile", label: "Mobile", width: "120px" },
        { key: "email", label: "Email" },
        {
            key: "isActive", label: "Status", width: "80px",
            render: (val: boolean) => (
                <span className={`badge ${val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {val ? "Active" : "Inactive"}
                </span>
            ),
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Subsidiary Institutions" breadcrumb={["Masters", "Subsidiaries"]} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Data Import</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowExcelUpload(true)}>
                        <Upload size={14} style={{ marginRight: "6px" }} />
                        Upload via Excel
                    </button>
                </div>
                <DataGrid
                    columns={columns}
                    data={data}
                    loading={loading}
                    onAdd={openAdd}
                    addLabel="Add Subsidiary"
                    onEdit={openEdit}
                    onDelete={(row) => setDeleteModal(row)}
                    searchPlaceholder="Search subsidiaries..."
                />
            </div>

            {/* Add/Edit Modal */}
            {modal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "520px" }}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === "add" ? "Add Subsidiary" : "Edit Subsidiary"}</span>
                            <button onClick={() => setModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="form-group">
                                        <label className="form-label">Institution Code *</label>
                                        <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. INST001" required disabled={modal === "edit"} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Mobile *</label>
                                        <input className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit number" maxLength={10} required />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Institution Name *</label>
                                        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full institution name" required />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Address</label>
                                        <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input className="form-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="State" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="institution@email.com" />
                                    </div>
                                    {modal === "edit" && (
                                        <div className="form-group" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                                            <input
                                                type="checkbox"
                                                checked={form.isActive}
                                                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                                style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                            />
                                            <label className="form-label" style={{ margin: 0, cursor: "pointer" }} onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                                                Active (Institution can login)
                                            </label>
                                        </div>
                                    )}
                                </div>
                                {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>{error}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                isOpen={!!deleteModal}
                onClose={() => setDeleteModal(null)}
                onConfirm={handleDelete}
                itemName={deleteModal?.name}
                loading={deleting}
            />

            {showExcelUpload && (
                <ExcelUploadModal
                    title="Upload Subsidiaries"
                    templateName="Subsidiary_Master_Template"
                    expectedColumns={["Code", "Name", "Mobile", "Email", "Address", "City", "State"]}
                    onClose={() => setShowExcelUpload(false)}
                    onUpload={handleExcelUpload}
                />
            )}
        </div>
    );
}
