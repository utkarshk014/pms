"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Eye, FileText, Clock, CheckCircle, XCircle, Edit2, Truck, CreditCard } from "lucide-react";
import { OtpVerificationModal } from "@/components/ui/OtpVerificationModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { formatDate, formatCurrency } from "@/lib/utils";

interface MrfLineItem {
    itemId: string;
    qty: number;
    expectedRate: number;
    description: string;
    item: { name: string; uom: string };
}

interface MrfRecord {
    id: string;
    mrfNumber: string;
    status: string;
    remarks: string;
    createdAt: string;
    mrfItems: MrfLineItem[];
}

interface StockItem {
    id: string;
    name: string;
    uom: string;
}

const STATUS_META: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
    DRAFT: { label: "Draft", bg: "#f3f4f6", color: "#374151", icon: Clock },
    SUBMITTED: { label: "Submitted", bg: "#dbeafe", color: "#1d4ed8", icon: Clock },
    APPROVED: { label: "Approved", bg: "#dcfce7", color: "#166534", icon: CheckCircle },
    REJECTED: { label: "Rejected", bg: "#fee2e2", color: "#991b1b", icon: XCircle },
    RFQ_SENT: { label: "RFQ Sent", bg: "#e0e7ff", color: "#4338ca", icon: CheckCircle },
    PO_ISSUED: { label: "PO Issued", bg: "#fef9c3", color: "#854d0e", icon: Truck },
    CLOSED: { label: "Closed", bg: "#d1fae5", color: "#065f46", icon: CheckCircle },
};

const MODAL: React.CSSProperties = {
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    border: "1px solid #e5e7eb",
};

const emptyLine = () => ({ itemId: "", qty: 1, expectedRate: 0, remarks: "" });

// ── Manage-Draft Modal ───────────────────────────────────────────
interface ManageModalProps {
    mrf: MrfRecord;
    stockItems: StockItem[];
    onClose: () => void;
    onSaved: () => void;
    onDeleted: () => void;
}

function ManageModal({ mrf, stockItems, onClose, onSaved, onDeleted }: ManageModalProps) {
    const [remarks, setRemarks] = useState(mrf.remarks || "");
    const [lines, setLines] = useState(
        mrf.mrfItems.length
            ? mrf.mrfItems.map(mi => ({
                itemId: mi.itemId,
                qty: mi.qty,
                expectedRate: mi.expectedRate,
                remarks: mi.description || "",
            }))
            : [emptyLine()]
    );

    const originalRef = useRef(JSON.stringify({ remarks: mrf.remarks || "", lines: mrf.mrfItems.map(mi => ({ itemId: mi.itemId, qty: mi.qty, expectedRate: mi.expectedRate, remarks: mi.description || "" })) }));
    const isDirty = JSON.stringify({ remarks, lines }) !== originalRef.current;

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState("");

    function updateLine(i: number, field: string, value: string | number) {
        setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
    }

    async function handleSave() {
        setError("");
        const filtered = lines.filter(l => l.itemId);
        if (!filtered.length) { setError("Select at least one item"); return; }
        setSaving(true);
        try {
            const res = await fetch(`/ api / subsidiary / mrf / ${mrf.id} `, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remarks, items: filtered }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to save"); return; }
            onSaved();
        } catch { setError("Network error"); }
        finally { setSaving(false); }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/ api / subsidiary / mrf / ${mrf.id} `, { method: "DELETE" });
            if (!res.ok) { const d = await res.json(); setError(d.error || "Delete failed"); setConfirmDelete(false); return; }
            onDeleted();
        } catch { setError("Network error"); setConfirmDelete(false); }
        finally { setDeleting(false); }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ ...MODAL, maxWidth: "780px", width: "95vw", maxHeight: "92vh", overflow: "auto" }}>
                {/* Header */}
                <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 className="modal-title">{mrf.mrfNumber}</h2>
                        <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Edit draft — changes are only saved when you click Save Changes</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div style={{ padding: "20px" }}>
                    {/* Remarks */}
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                        <label className="form-label">Remarks / Purpose</label>
                        <textarea className="form-input" rows={2} value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g. Lab equipment for semester 2..."
                            style={{ resize: "vertical" }} />
                    </div>

                    {/* Items */}
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#374151", marginBottom: "10px" }}>Items Required</div>
                    <table className="erp-table" style={{ marginBottom: "10px" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item *</th>
                                <th style={{ width: "80px" }}>Qty *</th>
                                <th style={{ width: "120px" }}>Expected Rate (₹)</th>
                                <th>Remarks</th>
                                <th style={{ width: "36px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, i) => (
                                <tr key={i}>
                                    <td style={{ textAlign: "center", color: "#6b7280" }}>{i + 1}</td>
                                    <td>
                                        <select className="form-input" value={line.itemId} onChange={e => updateLine(i, "itemId", e.target.value)}>
                                            <option value="">— Select —</option>
                                            {stockItems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.uom})</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" className="form-input" value={line.qty} min={1}
                                            onChange={e => updateLine(i, "qty", parseInt(e.target.value) || 1)} />
                                    </td>
                                    <td>
                                        <input type="number" className="form-input" value={line.expectedRate} min={0} step="0.01"
                                            onChange={e => updateLine(i, "expectedRate", parseFloat(e.target.value) || 0)} placeholder="0.00" />
                                    </td>
                                    <td>
                                        <input className="form-input" value={line.remarks}
                                            onChange={e => updateLine(i, "remarks", e.target.value)} placeholder="Optional..." />
                                    </td>
                                    <td>
                                        {lines.length > 1 && (
                                            <button className="btn btn-sm btn-danger"
                                                onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))} title="Remove">×</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-secondary btn-sm" onClick={() => setLines(prev => [...prev, emptyLine()])}>
                        <Plus size={12} /> Add Item
                    </button>

                    {error && (
                        <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", margin: "12px 0" }}>
                            {error}
                        </div>
                    )}

                    {/* Footer actions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                        {/* Delete side */}
                        <div>
                            {!confirmDelete ? (
                                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                                    Delete MRF
                                </button>
                            ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>Sure? This can't be undone.</span>
                                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                                        {deleting ? "Deleting..." : "Yes, Delete"}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                                </div>
                            )}
                        </div>

                        {/* Save side */}
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleSave}
                                disabled={!isDirty || saving}
                                title={!isDirty ? "No changes to save" : "Save changes"}
                                style={{ opacity: !isDirty ? 0.5 : 1 }}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Create Modal ────────────────────────────────────────────────
interface CreateModalProps {
    stockItems: StockItem[];
    onClose: () => void;
    onCreated: () => void;
}

function CreateModal({ stockItems, onClose, onCreated }: CreateModalProps) {
    const [remarks, setRemarks] = useState("");
    const [lines, setLines] = useState([emptyLine()]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function updateLine(i: number, field: string, value: string | number) {
        setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
    }

    async function handleSave() {
        setError("");
        const filtered = lines.filter(l => l.itemId);
        if (!filtered.length) { setError("Select at least one item"); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/subsidiary/mrf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remarks, items: filtered }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to save"); return; }
            onCreated();
        } catch { setError("Network error"); }
        finally { setSaving(false); }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ ...MODAL, maxWidth: "780px", width: "95vw", maxHeight: "92vh", overflow: "auto" }}>
                <div className="modal-header">
                    <h2 className="modal-title">New Material Requisition Form</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div style={{ padding: "20px" }}>
                    <div className="form-group" style={{ marginBottom: "16px" }}>
                        <label className="form-label">Remarks / Purpose</label>
                        <textarea className="form-input" rows={2} value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g. Lab equipment for semester 2..."
                            style={{ resize: "vertical" }} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#374151", marginBottom: "10px" }}>Items Required</div>
                    <table className="erp-table" style={{ marginBottom: "10px" }}>
                        <thead>
                            <tr>
                                <th>#</th><th>Item *</th>
                                <th style={{ width: "80px" }}>Qty *</th>
                                <th style={{ width: "120px" }}>Expected Rate (₹)</th>
                                <th>Remarks</th>
                                <th style={{ width: "36px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line, i) => (
                                <tr key={i}>
                                    <td style={{ textAlign: "center", color: "#6b7280" }}>{i + 1}</td>
                                    <td>
                                        <select className="form-input" value={line.itemId} onChange={e => updateLine(i, "itemId", e.target.value)}>
                                            <option value="">— Select —</option>
                                            {stockItems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.uom})</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" className="form-input" value={line.qty} min={1}
                                            onChange={e => updateLine(i, "qty", parseInt(e.target.value) || 1)} />
                                    </td>
                                    <td>
                                        <input type="number" className="form-input" value={line.expectedRate} min={0} step="0.01"
                                            onChange={e => updateLine(i, "expectedRate", parseFloat(e.target.value) || 0)} placeholder="0.00" />
                                    </td>
                                    <td>
                                        <input className="form-input" value={line.remarks}
                                            onChange={e => updateLine(i, "remarks", e.target.value)} placeholder="Optional..." />
                                    </td>
                                    <td>
                                        {lines.length > 1 && (
                                            <button className="btn btn-sm btn-danger"
                                                onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-secondary btn-sm" onClick={() => setLines(prev => [...prev, emptyLine()])}>
                        <Plus size={12} /> Add Item
                    </button>

                    {error && (
                        <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", margin: "12px 0" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "8px", marginTop: "20px", justifyContent: "flex-end" }}>
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save as Draft"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── PO Modal (Subsidiary: Mark Received + Record Payment) ───────────────────
function PoModal({ mrfId, onClose, onDone }: { mrfId: string; onClose: () => void; onDone: () => void }) {
    const [po, setPo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [remarks, setRemarks] = useState("");
    const [payAmount, setPayAmount] = useState("");
    const [payMode, setPayMode] = useState("NEFT");
    const [payRef, setPayRef] = useState("");
    const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        fetch("/api/subsidiary/po")
            .then(r => r.json())
            .then(d => {
                const found = (d.pos || []).find((p: any) => p.mrf.id === mrfId);
                setPo(found || null);
                setLoading(false);
            });
    }, [mrfId]);

    async function handleInward() {
        setError(""); setBusy(true);
        const res = await fetch(`/api/subsidiary/po/${po.id}/inward`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed"); setBusy(false); }
        else { onDone(); }
    }

    async function handlePayment() {
        if (!payAmount || parseFloat(payAmount) <= 0) { setError("Enter a valid amount"); return; }
        setError(""); setBusy(true);
        const res = await fetch(`/api/subsidiary/po/${po.id}/payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountPaid: parseFloat(payAmount), paymentMode: payMode, referenceNo: payRef, paymentDate: payDate }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed"); setBusy(false); }
        else { onDone(); }
    }

    const totalPaid = po?.payments?.reduce((s: number, p: any) => s + p.amountPaid, 0) || 0;
    const balance = (po?.totalAmount || 0) - totalPaid;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ ...MODAL, maxWidth: "620px", width: "95vw" }}>
                <div className="modal-header">
                    <h2 className="modal-title">Delivery &amp; Payment</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div style={{ padding: "20px" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", color: "#6b7280", padding: "30px" }}>Loading PO details...</div>
                    ) : !po ? (
                        <div style={{ color: "#dc2626", padding: "20px", textAlign: "center" }}>No PO found for this MRF.</div>
                    ) : (
                        <>
                            {/* PO Info */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "6px" }}>
                                <div><span style={{ color: "#6b7280" }}>PO: </span><strong>{po.poNumber}</strong></div>
                                <div><span style={{ color: "#6b7280" }}>Vendor: </span><strong>{po.vendor?.name}</strong></div>
                                <div><span style={{ color: "#6b7280" }}>Total: </span><strong style={{ color: "#2563eb" }}>{formatCurrency(po.totalAmount || 0)}</strong></div>
                                <div><span style={{ color: "#6b7280" }}>PO Status: </span><strong>{po.status}</strong></div>
                            </div>

                            {/* Step 1: Mark Goods Received */}
                            {po.status === "ISSUED" && (
                                <div style={{ marginBottom: "16px", padding: "14px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                                    <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>📦 Mark Goods Received</div>
                                    <div className="form-group">
                                        <label className="form-label">Remarks (optional)</label>
                                        <input className="form-input" placeholder="e.g. All items received in good condition" value={remarks} onChange={e => setRemarks(e.target.value)} />
                                    </div>
                                    <button className="btn btn-success btn-sm" onClick={handleInward} disabled={busy}>
                                        <Truck size={13} /> {busy ? "Saving..." : "Confirm Goods Received"}
                                    </button>
                                </div>
                            )}

                            {po.status === "DELIVERED" && (
                                <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#dcfce7", borderRadius: "6px", fontSize: "13px", color: "#166534" }}>
                                    ✅ Goods received. Record payment below to close this PO.
                                </div>
                            )}

                            {/* Step 2: Record Payment */}
                            {po.status === "DELIVERED" && (
                                <div style={{ padding: "14px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                                    <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>
                                        💰 Record Payment
                                        {balance > 0 && <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: "8px" }}>Outstanding: {formatCurrency(balance)}</span>}
                                    </div>
                                    {po.payments?.length > 0 && (
                                        <table className="erp-table" style={{ marginBottom: "12px" }}>
                                            <thead><tr><th>Date</th><th>Mode</th><th>Ref</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
                                            <tbody>
                                                {po.payments.map((p: any) => (
                                                    <tr key={p.id}>
                                                        <td>{formatDate(p.paymentDate)}</td>
                                                        <td>{p.paymentMode || "—"}</td>
                                                        <td>{p.referenceNo || "—"}</td>
                                                        <td style={{ textAlign: "right", color: "#166534", fontWeight: 600 }}>{formatCurrency(p.amountPaid)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    {balance > 0 && (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                                            <div className="form-group">
                                                <label className="form-label">Amount (₹) *</label>
                                                <input className="form-input" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={balance.toFixed(2)} step="0.01" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Mode</label>
                                                <select className="form-input" value={payMode} onChange={e => setPayMode(e.target.value)}>
                                                    <option>NEFT</option><option>RTGS</option><option>IMPS</option><option>Cheque</option><option>Cash</option><option>UPI</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Reference No</label>
                                                <input className="form-input" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="UTR / Cheque No" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Date</label>
                                                <input className="form-input" type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
                                            </div>
                                            <div style={{ gridColumn: "1/-1" }}>
                                                <button className="btn btn-primary btn-sm" onClick={handlePayment} disabled={busy}>
                                                    <CreditCard size={13} /> {busy ? "Saving..." : "Record Payment"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {po.status === "COMPLETED" && (
                                <div style={{ padding: "20px", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", textAlign: "center", color: "#166534" }}>
                                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
                                    <div style={{ fontWeight: 700, fontSize: "15px" }}>PO Completed &amp; MRF Closed</div>
                                    <div style={{ fontSize: "12px", marginTop: "4px", color: "#15803d" }}>All payments recorded. This MRF lifecycle is complete.</div>
                                </div>
                            )}

                            {error && <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px" }}>{error}</div>}
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SubsidiaryMrfPage() {

    const [mrfs, setMrfs] = useState<MrfRecord[]>([]);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [manageMrf, setManageMrf] = useState<MrfRecord | null>(null);
    const [viewMrf, setViewMrf] = useState<MrfRecord | null>(null);
    const [poMrfId, setPoMrfId] = useState<string | null>(null);
    const [confirmSubmitMrf, setConfirmSubmitMrf] = useState<MrfRecord | null>(null);
    const [submittingMrf, setSubmittingMrf] = useState<MrfRecord | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);

    const fetchData = useCallback(async () => {
        const [mrfRes, itemRes] = await Promise.all([
            fetch("/api/subsidiary/mrf"),
            fetch("/api/masters/stock-items"),
        ]);
        setMrfs((await mrfRes.json()).mrfs || []);
        setStockItems((await itemRes.json()).items || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    async function handleSubmit(mrf: MrfRecord) {
        setConfirmSubmitMrf(mrf);
    }

    async function handleConfirmedSubmit() {
        if (!confirmSubmitMrf) return;
        const mrf = confirmSubmitMrf;

        // 1. Close confirm modal
        setConfirmSubmitMrf(null);

        // 2. Open OTP modal immediately so user isn't stuck waiting
        setSubmittingMrf(mrf);
        setOtpLoading(true);

        // 3. Trigger OTP Email in background
        try {
            const otpRes = await fetch(`/api/transactions/mrf/${mrf.id}/send-otp`, { method: "POST" });
            if (!otpRes.ok) {
                const err = await otpRes.json();
                alert(`Failed to send OTP: ${err.error}`);
                setSubmittingMrf(null); // close it if failed
                return;
            }
        } catch (error: any) {
            alert(`Network error: ${error.message}`);
            setSubmittingMrf(null);
        } finally {
            setOtpLoading(false);
        }
    }

    async function handleVerifyOtp(otp: string): Promise<boolean> {
        if (!submittingMrf) return false;

        setOtpLoading(true);
        try {
            const res = await fetch(`/api/transactions/mrf/${submittingMrf.id}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }),
            });
            if (res.ok) {
                await fetchData();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        } finally {
            setOtpLoading(false);
        }
    }

    async function handleResendOtp(): Promise<void> {
        if (!submittingMrf) return;
        const res = await fetch(`/api/transactions/mrf/${submittingMrf.id}/send-otp`, { method: "POST" });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error);
        }
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                    <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>Material Requisition Forms</h1>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>Create and track your purchase requests</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                    <Plus size={14} /> New MRF
                </button>
            </div>

            {/* List */}
            <div className="data-card">
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading...</div>
                ) : mrfs.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <FileText size={48} style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No MRFs yet</p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Click &quot;New MRF&quot; to get started.</p>
                    </div>
                ) : (
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>MRF Number</th>
                                <th>Items</th>
                                <th>Remarks</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mrfs.map((mrf, i) => {
                                const meta = STATUS_META[mrf.status] || STATUS_META.DRAFT;
                                const StatusIcon = meta.icon;
                                const isDraft = mrf.status === "DRAFT";
                                return (
                                    <tr key={mrf.id}>
                                        <td style={{ textAlign: "center" }}>{i + 1}</td>
                                        <td><strong>{mrf.mrfNumber}</strong></td>
                                        <td style={{ textAlign: "center" }}>{mrf.mrfItems?.length || 0}</td>
                                        <td style={{ color: "#6b7280", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {mrf.remarks || "—"}
                                        </td>
                                        <td>{formatDate(mrf.createdAt)}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: meta.bg, color: meta.color, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <StatusIcon size={10} />{meta.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                                {isDraft ? (
                                                    <>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => setManageMrf(mrf)} title="Edit / Delete" style={{ color: "#2563eb" }}>
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button className="btn btn-sm btn-primary" onClick={() => handleSubmit(mrf)} style={{ fontSize: "11px" }}>Submit</button>
                                                    </>
                                                ) : mrf.status === "PO_ISSUED" ? (
                                                    <button className="btn btn-sm btn-warning" onClick={() => setPoMrfId(mrf.id)} title="Mark Received / Record Payment" style={{ fontSize: "11px", background: "#f59e0b", color: "white", border: "none" }}>
                                                        <Truck size={13} /> Delivery & Payment
                                                    </button>
                                                ) : mrf.status === "CLOSED" ? (
                                                    <span style={{ fontSize: "11px", color: "#065f46", fontWeight: 600 }}>✅ Complete</span>
                                                ) : (
                                                    <button className="btn btn-sm btn-secondary" onClick={() => setViewMrf(mrf)} title="View"><Eye size={13} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <CreateModal
                    stockItems={stockItems}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); fetchData(); }}
                />
            )}

            {/* Edit/Delete (Manage) Modal — DRAFT only */}
            {manageMrf && (
                <ManageModal
                    mrf={manageMrf}
                    stockItems={stockItems}
                    onClose={() => setManageMrf(null)}
                    onSaved={() => { setManageMrf(null); fetchData(); }}
                    onDeleted={() => { setManageMrf(null); fetchData(); }}
                />
            )}

            {/* View Modal — non-draft */}
            {viewMrf && (
                <div className="modal-overlay" onClick={() => setViewMrf(null)}>
                    <div onClick={e => e.stopPropagation()} style={{ ...MODAL, maxWidth: "620px", width: "95vw" }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{viewMrf.mrfNumber}</h2>
                            <button className="modal-close" onClick={() => setViewMrf(null)}>×</button>
                        </div>
                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", fontSize: "13px" }}>
                                <div><span style={{ color: "#6b7280" }}>Status: </span><strong>{STATUS_META[viewMrf.status]?.label}</strong></div>
                                <div><span style={{ color: "#6b7280" }}>Date: </span>{formatDate(viewMrf.createdAt)}</div>
                                {viewMrf.remarks && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#6b7280" }}>Remarks: </span>{viewMrf.remarks}</div>}
                            </div>
                            <table className="erp-table">
                                <thead><tr><th>#</th><th>Item</th><th>UOM</th><th>Qty</th><th>Rate (₹)</th></tr></thead>
                                <tbody>
                                    {viewMrf.mrfItems?.map((mi, i) => (
                                        <tr key={i}>
                                            <td style={{ textAlign: "center" }}>{i + 1}</td>
                                            <td>{mi.item.name}</td>
                                            <td>{mi.item.uom}</td>
                                            <td style={{ textAlign: "center" }}>{mi.qty}</td>
                                            <td style={{ textAlign: "right" }}>{mi.expectedRate > 0 ? `₹${mi.expectedRate}` : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* PO Delivery & Payment Modal */}
            {poMrfId && (
                <PoModal
                    mrfId={poMrfId}
                    onClose={() => setPoMrfId(null)}
                    onDone={() => { setPoMrfId(null); fetchData(); }}
                />
            )}

            {/* Confirm Submit Modal */}
            <ConfirmModal
                isOpen={!!confirmSubmitMrf}
                title="Submit MRF"
                message={`Are you sure you want to submit MRF ${confirmSubmitMrf?.mrfNumber}? Once submitted, you cannot edit the items or quantities.`}
                confirmLabel="Yes, Submit"
                onClose={() => setConfirmSubmitMrf(null)}
                onConfirm={handleConfirmedSubmit}
            />

            {/* OTP Verification Modal */}
            <OtpVerificationModal
                isOpen={!!submittingMrf}
                onClose={() => setSubmittingMrf(null)}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                loading={otpLoading}
            />
        </div>
    );
}
