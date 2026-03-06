"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, Eye, X, CheckCircle, CreditCard } from "lucide-react";

/* ── Types ── */
interface PoDetail {
    id: string;
    poNumber: string;
    status: string;
    totalAmount: number;
    deliveryPeriod: string | null;
    paymentTerms: string | null;
    termsConditions: string | null;
    createdAt: string;
    mrf: {
        mrfNumber: string;
        subsidiary: { name: string };
        mrfItems: { qty: number; expectedRate: number; description: string | null; item: { name: string; uom: string } }[];
    };
    vendor: { id: string; name: string; email: string };
    goodsInward: { id: string; receivedDate: string; remarks: string | null }[];
    payments: { id: string; amountPaid: number; paymentDate: string; paymentMode: string | null; referenceNo: string | null; status: string }[];
}

interface PoListItem {
    id: string;
    poNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    mrf: { mrfNumber: string; subsidiary: { name: string } };
    vendor: { name: string };
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    ISSUED: { bg: "#dbeafe", color: "#1d4ed8" },
    DELIVERED: { bg: "#dcfce7", color: "#166534" },
    COMPLETED: { bg: "#f0fdf4", color: "#15803d" },
    CANCELLED: { bg: "#fef2f2", color: "#991b1b" },
};

/* ── PO Detail Modal ── */
function PoDetailModal({ poId, onClose, onRefresh }: { poId: string; onClose: () => void; onRefresh: () => void }) {
    const [po, setPo] = useState<PoDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // Payment form
    const [showPayment, setShowPayment] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [payMode, setPayMode] = useState("NEFT");
    const [payRef, setPayRef] = useState("");
    const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

    const fetchPo = useCallback(async () => {
        const res = await fetch(`/api/transactions/po/${poId}`);
        const data = await res.json();
        setPo(data.po || null);
        setLoading(false);
    }, [poId]);

    useEffect(() => { fetchPo(); }, [fetchPo]);

    async function handleMarkDelivered() {
        setError(""); setActionLoading(true);
        const res = await fetch(`/api/transactions/po/${poId}/deliver`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed"); }
        else { await fetchPo(); onRefresh(); }
        setActionLoading(false);
    }

    async function handlePayment() {
        if (!payAmount || parseFloat(payAmount) <= 0) { setError("Enter a valid amount"); return; }
        setError(""); setActionLoading(true);
        const res = await fetch(`/api/transactions/po/${poId}/payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountPaid: parseFloat(payAmount), paymentMode: payMode, referenceNo: payRef, paymentDate: payDate }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Payment failed"); }
        else { setShowPayment(false); setPayAmount(""); setPayRef(""); await fetchPo(); onRefresh(); }
        setActionLoading(false);
    }

    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: "700px" }}>
                <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>Loading...</div>
            </div>
        </div>
    );
    if (!po) return null;

    const totalPaid = po.payments.reduce((s, p) => s + p.amountPaid, 0);
    const balance = po.totalAmount - totalPaid;

    // Status steps
    const steps = ["ISSUED", "DELIVERED", "COMPLETED"];
    const currentStep = steps.indexOf(po.status);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: "780px", maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <span className="modal-title">{po.poNumber}</span>
                        <span style={{ marginLeft: "8px" }}>
                            <span style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "20px", fontWeight: 600, background: STATUS_COLORS[po.status]?.bg || "#f3f4f6", color: STATUS_COLORS[po.status]?.color || "#374151" }}>
                                {po.status}
                            </span>
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                            onClick={() => window.open(`/api/transactions/po/${po.id}/pdf`, '_blank')}
                            className="btn btn-primary btn-sm"
                            title="Download PDF"
                        >
                            Download PDF
                        </button>
                        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}><X size={16} /></button>
                    </div>
                </div>

                <div className="modal-body">
                    {/* Status progress bar */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "0" }}>
                        {steps.map((step, i) => {
                            const done = i <= currentStep;
                            const isLast = i === steps.length - 1;
                            return (
                                <div key={step} style={{ display: "flex", alignItems: "center", flex: isLast ? "0" : "1" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? "#16a34a" : "#e5e7eb", color: done ? "white" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                                            {done ? <CheckCircle size={14} /> : i + 1}
                                        </div>
                                        <div style={{ fontSize: "10px", color: done ? "#16a34a" : "#9ca3af", fontWeight: 600, marginTop: "4px", whiteSpace: "nowrap" }}>{step}</div>
                                    </div>
                                    {!isLast && <div style={{ flex: 1, height: "2px", background: i < currentStep ? "#16a34a" : "#e5e7eb", margin: "0 4px", marginBottom: "16px" }} />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Info grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", marginBottom: "20px" }}>
                        <div><span style={{ color: "#6b7280" }}>Institution: </span><strong>{po.mrf.subsidiary?.name}</strong></div>
                        <div><span style={{ color: "#6b7280" }}>Vendor: </span><strong>{po.vendor?.name}</strong></div>
                        <div><span style={{ color: "#6b7280" }}>MRF: </span>{po.mrf.mrfNumber}</div>
                        <div><span style={{ color: "#6b7280" }}>Date Issued: </span>{formatDate(po.createdAt)}</div>
                        {po.deliveryPeriod && <div><span style={{ color: "#6b7280" }}>Delivery Period: </span>{po.deliveryPeriod}</div>}
                        {po.paymentTerms && <div><span style={{ color: "#6b7280" }}>Payment Terms: </span>{po.paymentTerms}</div>}
                    </div>

                    {/* Items from MRF */}
                    <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>Items</div>
                    <table className="erp-table" style={{ marginBottom: "20px" }}>
                        <thead>
                            <tr><th>#</th><th>Item</th><th>UOM</th><th style={{ textAlign: "center" }}>Qty</th><th style={{ textAlign: "right" }}>Rate (₹)</th><th style={{ textAlign: "right" }}>Amount (₹)</th></tr>
                        </thead>
                        <tbody>
                            {po.mrf.mrfItems.map((item, i) => (
                                <tr key={i}>
                                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                                    <td>{item.item.name}</td>
                                    <td>{item.item.uom}</td>
                                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                                    <td style={{ textAlign: "right" }}>{item.expectedRate > 0 ? `₹${item.expectedRate.toFixed(2)}` : "—"}</td>
                                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(item.qty * item.expectedRate)}</td>
                                </tr>
                            ))}
                            <tr style={{ background: "#f0f9ff" }}>
                                <td colSpan={5} style={{ textAlign: "right", fontWeight: 700 }}>PO Total:</td>
                                <td style={{ textAlign: "right", fontWeight: 700, color: "#2563eb" }}>{formatCurrency(po.totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Payments section */}
                    <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>Payments</div>
                    {po.payments.length === 0 ? (
                        <div style={{ padding: "12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "13px", color: "#92400e", marginBottom: "16px" }}>
                            No payments recorded yet. Total outstanding: <strong>{formatCurrency(po.totalAmount)}</strong>
                        </div>
                    ) : (
                        <table className="erp-table" style={{ marginBottom: "8px" }}>
                            <thead>
                                <tr><th>Date</th><th>Mode</th><th>Reference</th><th style={{ textAlign: "right" }}>Amount</th></tr>
                            </thead>
                            <tbody>
                                {po.payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{formatDate(p.paymentDate)}</td>
                                        <td>{p.paymentMode || "—"}</td>
                                        <td>{p.referenceNo || "—"}</td>
                                        <td style={{ textAlign: "right", fontWeight: 600, color: "#16a34a" }}>{formatCurrency(p.amountPaid)}</td>
                                    </tr>
                                ))}
                                <tr style={{ background: "#f0fdf4" }}>
                                    <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>Paid: <span style={{ color: "#16a34a" }}>{formatCurrency(totalPaid)}</span> | Balance:</td>
                                    <td style={{ textAlign: "right", fontWeight: 700, color: balance > 0 ? "#dc2626" : "#16a34a" }}>{formatCurrency(balance)}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}


                    {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", marginBottom: "8px" }}>{error}</div>}

                </div>

                {/* Footer - CPT is read-only, actions belong to subsidiary */}
                <div className="modal-footer">
                    <div style={{ flex: 1, fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
                        ℹ️ Delivery and payment are managed by the subsidiary institution.
                    </div>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function PurchaseOrdersPage() {
    const [pos, setPos] = useState<PoListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewPoId, setViewPoId] = useState<string | null>(null);

    const fetchPos = useCallback(async () => {
        try {
            const res = await fetch("/api/transactions/po");
            const data = await res.json();
            setPos(data.pos || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPos(); }, [fetchPos]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Purchase Orders (PO)" breadcrumb={["Transactions", "PO"]} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading...</div>
                ) : pos.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <ShoppingCart size={48} style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No Purchase Orders yet</p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            POs are generated from RFQ quote comparisons. Go to{" "}
                            <a href="/transactions/rfq" style={{ color: "#2563eb" }}>RFQ Management</a>.
                        </p>
                    </div>
                ) : (
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>PO Number</th>
                                <th>MRF Number</th>
                                <th>Institution</th>
                                <th>Vendor</th>
                                <th style={{ textAlign: "right" }}>Total Amount</th>
                                <th>Date Issued</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pos.map((po, i) => {
                                const colors = STATUS_COLORS[po.status] || { bg: "#f3f4f6", color: "#374151" };
                                return (
                                    <tr key={po.id}>
                                        <td style={{ textAlign: "center" }}>{i + 1}</td>
                                        <td><strong>{po.poNumber}</strong></td>
                                        <td>{po.mrf.mrfNumber}</td>
                                        <td>{po.mrf.subsidiary?.name}</td>
                                        <td>{po.vendor?.name}</td>
                                        <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(po.totalAmount)}</td>
                                        <td>{formatDate(po.createdAt)}</td>
                                        <td>
                                            <span style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "20px", fontWeight: 600, background: colors.bg, color: colors.color }}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary" title="View PO" onClick={() => setViewPoId(po.id)}>
                                                <Eye size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {viewPoId && (
                <PoDetailModal
                    poId={viewPoId}
                    onClose={() => setViewPoId(null)}
                    onRefresh={fetchPos}
                />
            )}
        </div>
    );
}
