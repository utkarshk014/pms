"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { DataGrid } from "@/components/grid/DataGrid";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { X, Check, XCircle, Eye, Send } from "lucide-react";

interface MrfItem { id: string; itemId: string; item: { name: string; uom: string }; qty: number; expectedRate: number; taxPercent: number; otherCharges: number; totalAmount: number; }
interface Mrf { id: string; mrfNumber: string; status: string; totalAmount: number; createdAt: string; submittedAt: string; subsidiary: { name: string; code: string }; mrfItems: MrfItem[]; rejectedReason?: string; remarks?: string; }

export default function MrfPage() {
    const [data, setData] = useState<Mrf[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMrf, setViewMrf] = useState<Mrf | null>(null);
    const [rejectModal, setRejectModal] = useState<Mrf | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    async function fetchData() {
        setLoading(true);
        const res = await fetch("/api/transactions/mrf");
        const json = await res.json();
        setData(json.mrfs || []);
        setLoading(false);
    }
    useEffect(() => { fetchData(); }, []);

    async function handleApprove(mrf: Mrf) {
        setActionLoading(true);
        await fetch(`/api/transactions/mrf/${mrf.id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        setActionLoading(false);
        if (viewMrf?.id === mrf.id) setViewMrf(null);
        fetchData();
    }

    async function handleReject() {
        if (!rejectModal || !rejectReason.trim()) return;
        setActionLoading(true);
        await fetch(`/api/transactions/mrf/${rejectModal.id}/reject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: rejectReason }) });
        setActionLoading(false);
        setRejectModal(null);
        setRejectReason("");
        fetchData();
    }

    const columns = [
        { key: "mrfNumber", label: "MRF No", width: "120px" },
        { key: "subsidiary", label: "Institution", render: (_: any, row: Mrf) => row.subsidiary?.name || "-" },
        { key: "status", label: "Status", width: "100px", render: (v: string) => <span className={`badge ${getStatusColor(v)}`}>{v}</span> },
        { key: "totalAmount", label: "Total (₹)", width: "110px", render: (v: number) => formatCurrency(v) },
        { key: "createdAt", label: "Created", width: "100px", render: (v: string) => formatDate(v) },
        { key: "submittedAt", label: "Submitted", width: "100px", render: (v: string) => formatDate(v) },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Material Requisition Forms" breadcrumb={["Transactions", "MRF"]} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <DataGrid
                    columns={columns}
                    data={data}
                    loading={loading}
                    onView={(row) => setViewMrf(row)}
                    searchPlaceholder="Search MRFs..."
                    extraActions={(row) => (
                        <>
                            {row.status === "SUBMITTED" && (
                                <>
                                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(row)} title="Approve" disabled={actionLoading}><Check size={11} /></button>
                                    <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(row); setRejectReason(""); }} title="Reject"><XCircle size={11} /></button>
                                </>
                            )}
                            {row.status === "APPROVED" && (
                                <a href={`/transactions/rfq/create?mrfId=${row.id}`} className="btn btn-warning btn-sm" style={{ fontSize: "12px" }}>
                                    <Send size={11} /> RFQ
                                </a>
                            )}
                        </>
                    )}
                />
            </div>

            {/* View MRF Modal */}
            {viewMrf && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "750px" }}>
                        <div className="modal-header">
                            <div>
                                <span className="modal-title">{viewMrf.mrfNumber}</span>
                                <span className={`badge ${getStatusColor(viewMrf.status)}`} style={{ marginLeft: "8px" }}>{viewMrf.status}</span>
                            </div>
                            <button onClick={() => setViewMrf(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", fontSize: "13px" }}>
                                <div><span style={{ color: "#6b7280" }}>Institution:</span> <strong>{viewMrf.subsidiary?.name}</strong></div>
                                <div><span style={{ color: "#6b7280" }}>Created:</span> {formatDate(viewMrf.createdAt)}</div>
                                <div><span style={{ color: "#6b7280" }}>Submitted:</span> {formatDate(viewMrf.submittedAt)}</div>
                                <div><span style={{ color: "#6b7280" }}>Total:</span> <strong style={{ color: "#2563eb" }}>{formatCurrency(viewMrf.totalAmount)}</strong></div>
                                {viewMrf.remarks && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#6b7280" }}>Remarks:</span> {viewMrf.remarks}</div>}
                                {viewMrf.rejectedReason && <div style={{ gridColumn: "1/-1", color: "#dc2626" }}><span style={{ fontWeight: 600 }}>Rejection Reason:</span> {viewMrf.rejectedReason}</div>}
                            </div>

                            {/* Items table */}
                            <table className="erp-table">
                                <thead>
                                    <tr>
                                        <th>#</th><th>Item</th><th>Qty</th><th>UOM</th><th>Rate (₹)</th><th>Tax %</th><th>Other (₹)</th><th>Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewMrf.mrfItems?.map((item, i) => (
                                        <tr key={item.id}>
                                            <td>{i + 1}</td>
                                            <td>{item.item?.name}</td>
                                            <td>{item.qty}</td>
                                            <td>{item.item?.uom}</td>
                                            <td>{item.expectedRate.toFixed(2)}</td>
                                            <td>{item.taxPercent}%</td>
                                            <td>{item.otherCharges.toFixed(2)}</td>
                                            <td><strong>{formatCurrency(item.totalAmount)}</strong></td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: "#f0f9ff" }}>
                                        <td colSpan={7} style={{ textAlign: "right", fontWeight: 700 }}>Grand Total:</td>
                                        <td><strong style={{ color: "#2563eb" }}>{formatCurrency(viewMrf.totalAmount)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            {viewMrf.status === "SUBMITTED" && (
                                <>
                                    <button className="btn btn-danger" onClick={() => { setRejectModal(viewMrf); setViewMrf(null); }}>Reject</button>
                                    <button className="btn btn-success" onClick={() => handleApprove(viewMrf)} disabled={actionLoading}>{actionLoading ? "Approving..." : "Approve"}</button>
                                </>
                            )}
                            <button className="btn btn-secondary" onClick={() => setViewMrf(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "420px" }}>
                        <div className="modal-header">
                            <span className="modal-title" style={{ color: "#dc2626" }}>Reject MRF</span>
                            <button onClick={() => setRejectModal(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: "13px", color: "#374151", marginBottom: "12px" }}>
                                Rejecting <strong>{rejectModal.mrfNumber}</strong>. Please provide a reason:
                            </p>
                            <div className="form-group">
                                <label className="form-label">Rejection Reason *</label>
                                <textarea className="form-input" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this MRF is being rejected..." style={{ resize: "vertical" }} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}>{actionLoading ? "Rejecting..." : "Confirm Reject"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
