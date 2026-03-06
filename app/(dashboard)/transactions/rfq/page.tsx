"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { formatDate, formatCurrency } from "@/lib/utils";
import { FileText, Eye, Copy, Check, X, Trophy } from "lucide-react";

/* ── Types ── */
interface VendorQuoteItem {
    id: string;
    itemId: string;
    rate: number;
    totalAmount: number;
    deliveryDays: number | null;
    terms: string | null;
    item: { id: string; name: string; uom: string };
}

interface VendorMapping {
    id: string;
    secureToken: string;
    quoteSubmitted: boolean;
    submittedAt: string | null;
    vendor: { id: string; name: string; email: string };
    quotes: VendorQuoteItem[];
}

interface RfqDetail {
    id: string;
    rfqNumber: string;
    status: string;
    lastDateSubmission: string | null;
    createdAt: string;
    mrf: {
        id: string;
        mrfNumber: string;
        subsidiary: { name: string };
        mrfItems: { id: string; qty: number; item: { name: string; uom: string; code: string }; itemId: string }[];
    };
    rfqVendorMappings: VendorMapping[];
}

interface RfqListItem {
    id: string;
    rfqNumber: string;
    status: string;
    lastDateSubmission: string | null;
    createdAt: string;
    mrf: { mrfNumber: string; subsidiary: { name: string } };
    rfqVendorMappings: { quoteSubmitted: boolean }[];
}

// Use current origin so vendor links always match the running port
const APP_URL = typeof window !== "undefined" ? window.location.origin : "";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    OPEN: { bg: "#dbeafe", color: "#1d4ed8" },
    CLOSED: { bg: "#dcfce7", color: "#166534" },
    CANCELLED: { bg: "#fef2f2", color: "#991b1b" },
};

/* ── Helpers ── */
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            className="btn btn-sm btn-secondary"
            style={{ padding: "2px 6px" }}
            title="Copy link"
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        >
            {copied ? <Check size={12} style={{ color: "#16a34a" }} /> : <Copy size={12} />}
        </button>
    );
}

/* ── Quote Comparison Modal ── */
function RfqDetailModal({ rfqId, onClose, appUrl }: { rfqId: string; onClose: () => void; appUrl: string }) {
    const [rfq, setRfq] = useState<RfqDetail | null>(null);
    const [existingPo, setExistingPo] = useState<{ id: string; poNumber: string; vendor: { name: string } } | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [poError, setPoError] = useState("");
    const [poSuccess, setPoSuccess] = useState("");

    useEffect(() => {
        fetch(`/api/transactions/rfq/${rfqId}`)
            .then(r => r.json())
            .then(d => { setRfq(d.rfq || null); setExistingPo(d.existingPo || null); setLoading(false); });
    }, [rfqId]);

    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: "800px" }}>
                <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>Loading...</div>
            </div>
        </div>
    );

    if (!rfq) return null;

    const submittedMappings = rfq.rfqVendorMappings.filter(m => m.quoteSubmitted);

    // Build per-item comparison: match by itemId (mrfItem.itemId = VendorQuoteItem.itemId)
    const itemComparison = rfq.mrf.mrfItems.map(mrfItem => {
        const vendorRates = submittedMappings.map(mapping => {
            const qi = mapping.quotes.find(q => q.itemId === mrfItem.itemId);
            return { vendor: mapping.vendor, rate: qi?.rate ?? null, total: qi?.totalAmount ?? null };
        });
        const validRates = vendorRates.filter(v => v.rate !== null).sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0));
        return { mrfItem, vendorRates, l1: validRates[0] ?? null };
    });

    // L1 vendor = vendor whose total across all items is lowest
    const vendorTotals = submittedMappings.map(m => ({
        vendor: m.vendor,
        mapping: m,
        total: m.quotes.reduce((s, qi) => s + (qi.totalAmount || 0), 0),
        deliveryDays: m.quotes[0]?.deliveryDays ?? null,
        paymentTerms: m.quotes[0]?.terms ?? null,
    })).sort((a, b) => a.total - b.total);

    async function handleGeneratePO(vt: typeof vendorTotals[0]) {
        setPoError(""); setPoSuccess("");
        setGenerating(true);
        try {
            const res = await fetch("/api/transactions/po", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mrfId: rfq!.mrf.id,
                    vendorId: vt.vendor.id,
                    totalAmount: vt.total,
                    deliveryPeriod: vt.deliveryDays ? `${vt.deliveryDays} days` : "",
                    paymentTerms: vt.paymentTerms || "",
                }),
            });
            const data = await res.json();
            if (!res.ok) { setPoError(data.error || "Failed to generate PO"); return; }
            setPoSuccess(`✅ PO ${data.po.poNumber} generated for ${vt.vendor.name}! Go to Transactions → PO to view it.`);
        } catch { setPoError("Network error"); }
        finally { setGenerating(false); }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                style={{ maxWidth: "900px", maxHeight: "90vh", overflow: "auto" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <span className="modal-title">{rfq.rfqNumber}</span>
                        <span style={{ marginLeft: "8px", fontSize: "12px", color: "#6b7280" }}>
                            MRF: {rfq.mrf.mrfNumber} · {rfq.mrf.subsidiary?.name}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}>
                        <X size={16} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Vendor Links */}
                    <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "#374151", marginBottom: "10px" }}>
                            Vendor Portal Links
                        </div>
                        <table className="erp-table">
                            <thead>
                                <tr><th>Vendor</th><th>Email</th><th>Status</th><th>Submitted</th></tr>
                            </thead>
                            <tbody>
                                {rfq.rfqVendorMappings.map(m => (
                                    <tr key={m.id}>
                                        <td><strong>{m.vendor.name}</strong></td>
                                        <td style={{ color: "#6b7280" }}>{m.vendor.email || "—"}</td>
                                        <td>
                                            <span style={{
                                                fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: 600,
                                                background: m.quoteSubmitted ? "#dcfce7" : "#fef3c7",
                                                color: m.quoteSubmitted ? "#166534" : "#92400e",
                                            }}>
                                                {m.quoteSubmitted ? "Quote Received" : "Pending"}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "12px" }}>{m.submittedAt ? formatDate(m.submittedAt) : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Quote Comparison */}
                    {submittedMappings.length === 0 ? (
                        <div style={{ padding: "20px", background: "#fef3c7", borderRadius: "6px", fontSize: "13px", color: "#92400e", textAlign: "center" }}>
                            No quotes received yet. Share the vendor links above to collect quotes.
                        </div>
                    ) : (
                        <>
                            <div style={{ fontWeight: 700, fontSize: "13px", color: "#374151", marginBottom: "10px" }}>
                                Quote Comparison — {submittedMappings.length} quote{submittedMappings.length !== 1 ? "s" : ""} received
                            </div>

                            {/* Item-wise comparison */}
                            <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Item</th>
                                            <th>UOM</th>
                                            <th>Req Qty</th>
                                            {submittedMappings.map(m => (
                                                <th key={m.id} style={{ textAlign: "right", minWidth: "110px" }}>
                                                    {m.vendor.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemComparison.map(({ mrfItem, vendorRates, l1 }, i) => (
                                            <tr key={mrfItem.id}>
                                                <td style={{ textAlign: "center" }}>{i + 1}</td>
                                                <td>{mrfItem.item.name}</td>
                                                <td>{mrfItem.item.uom}</td>
                                                <td style={{ textAlign: "center" }}>{mrfItem.qty}</td>
                                                {vendorRates.map(({ vendor, rate, total }) => {
                                                    const isL1 = l1?.vendor.id === vendor.id;
                                                    return (
                                                        <td key={vendor.id} style={{ textAlign: "right" }}>
                                                            {rate !== null ? (
                                                                <div>
                                                                    <span style={{
                                                                        fontWeight: isL1 ? 700 : 400,
                                                                        color: isL1 ? "#166534" : "#111827",
                                                                    }}>
                                                                        ₹{rate.toFixed(2)}
                                                                    </span>
                                                                    {isL1 && (
                                                                        <span style={{ marginLeft: "4px", fontSize: "10px", background: "#dcfce7", color: "#166534", padding: "1px 5px", borderRadius: "10px" }}>
                                                                            L1
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : <span style={{ color: "#d1d5db" }}>—</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}

                                        {/* Grand total row */}
                                        <tr style={{ background: "#f0f9ff", fontWeight: 700 }}>
                                            <td colSpan={4} style={{ textAlign: "right" }}>Grand Total</td>
                                            {vendorTotals.length > 0
                                                ? submittedMappings.map(m => {
                                                    const vt = vendorTotals.find(v => v.vendor.id === m.vendor.id);
                                                    const isLowest = vendorTotals[0]?.vendor.id === m.vendor.id;
                                                    return (
                                                        <td key={m.id} style={{ textAlign: "right" }}>
                                                            <span style={{ color: isLowest ? "#166534" : "#111827" }}>
                                                                {formatCurrency(vt?.total || 0)}
                                                            </span>
                                                            {isLowest && <span style={{ marginLeft: "4px" }}><Trophy size={12} style={{ color: "#16a34a", display: "inline" }} /></span>}
                                                        </td>
                                                    );
                                                })
                                                : null
                                            }
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* PO Generation */}
                            {existingPo ? (
                                <div style={{ padding: "14px 18px", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontSize: "20px" }}>✅</span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#166534" }}>Purchase Order Already Generated</div>
                                        <div style={{ fontSize: "13px", color: "#15803d", marginTop: "2px" }}>
                                            {existingPo.poNumber} issued to <strong>{existingPo.vendor.name}</strong>
                                        </div>
                                    </div>
                                    <a href="/transactions/po" className="btn btn-sm btn-secondary" style={{ marginLeft: "auto" }}>View PO →</a>
                                </div>
                            ) : poSuccess ? (
                                <div style={{ padding: "12px 16px", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", fontSize: "13px" }}>
                                    {poSuccess}
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#374151", marginBottom: "10px" }}>
                                        Generate Purchase Order
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                        {vendorTotals.map((vt, rank) => (
                                            <div key={vt.vendor.id} style={{
                                                border: `1px solid ${rank === 0 ? "#16a34a" : "#e5e7eb"}`,
                                                borderRadius: "8px",
                                                padding: "12px 16px",
                                                background: rank === 0 ? "#f0fdf4" : "white",
                                                flex: "1",
                                                minWidth: "180px",
                                            }}>
                                                <div style={{ fontSize: "11px", fontWeight: 700, color: rank === 0 ? "#16a34a" : "#6b7280", marginBottom: "4px" }}>
                                                    {rank === 0 ? "🥇 L1 — Lowest" : rank === 1 ? "🥈 L2" : "🥉 L3"}
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>{vt.vendor.name}</div>
                                                <div style={{ fontSize: "13px", color: "#374151", margin: "4px 0" }}>{formatCurrency(vt.total)}</div>
                                                {vt.deliveryDays && (
                                                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Delivery: {vt.deliveryDays} days</div>
                                                )}
                                                <button
                                                    className={`btn btn-sm ${rank === 0 ? "btn-success" : "btn-secondary"}`}
                                                    style={{ marginTop: "10px", width: "100%" }}
                                                    onClick={() => handleGeneratePO(vt)}
                                                    disabled={generating}
                                                >
                                                    {generating ? "Generating..." : "Generate PO"}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {poError && (
                                        <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px" }}>
                                            {poError}
                                        </div>
                                    )}
                                </div>
                            )}
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

/* ── Main Page ── */
export default function RfqPage() {
    const [rfqs, setRfqs] = useState<RfqListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewRfqId, setViewRfqId] = useState<string | null>(null);

    const fetchRfqs = useCallback(async () => {
        try {
            const res = await fetch("/api/transactions/rfq");
            const data = await res.json();
            setRfqs(data.rfqs || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRfqs(); }, [fetchRfqs]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Request for Quotation (RFQ)" breadcrumb={["Transactions", "RFQ"]} />
            <div style={{ flex: 1, margin: "16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading...</div>
                ) : rfqs.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <FileText size={48} style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No RFQs yet</p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            RFQs are created from approved MRFs. Go to{" "}
                            <a href="/transactions/mrf" style={{ color: "#2563eb" }}>MRF Management</a>{" "}
                            and click &quot;Create RFQ&quot; on an approved MRF.
                        </p>
                    </div>
                ) : (
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>RFQ Number</th>
                                <th>MRF Number</th>
                                <th>Institution</th>
                                <th style={{ textAlign: "center" }}>Vendors</th>
                                <th style={{ textAlign: "center" }}>Quotes</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rfqs.map((rfq, i) => {
                                const colors = STATUS_COLORS[rfq.status] || { bg: "#f3f4f6", color: "#374151" };
                                const submitted = rfq.rfqVendorMappings.filter(m => m.quoteSubmitted).length;
                                const total = rfq.rfqVendorMappings.length;
                                return (
                                    <tr key={rfq.id}>
                                        <td style={{ textAlign: "center" }}>{i + 1}</td>
                                        <td><strong>{rfq.rfqNumber}</strong></td>
                                        <td>{rfq.mrf.mrfNumber}</td>
                                        <td>{rfq.mrf.subsidiary?.name}</td>
                                        <td style={{ textAlign: "center" }}>{total}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <span style={{ color: submitted > 0 ? "#166534" : "#6b7280", fontWeight: submitted > 0 ? 700 : 400 }}>
                                                {submitted}/{total}
                                            </span>
                                        </td>
                                        <td>{rfq.lastDateSubmission ? formatDate(rfq.lastDateSubmission) : "—"}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: colors.bg, color: colors.color }}>
                                                {rfq.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                title="View quotes & generate PO"
                                                onClick={() => setViewRfqId(rfq.id)}
                                            >
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

            {viewRfqId && (
                <RfqDetailModal
                    rfqId={viewRfqId}
                    onClose={() => { setViewRfqId(null); fetchRfqs(); }}
                    appUrl={APP_URL}
                />
            )}
        </div>
    );
}
