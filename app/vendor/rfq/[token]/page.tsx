"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, CheckCircle } from "lucide-react";

interface MrfItem {
    id: string;
    itemId: string;
    item: { name: string; uom: string };
    qty: number;
    expectedRate: number;
}

interface VendorMapping {
    id: string;
    vendorId: string;
    vendor: { name: string; email: string };
    quoteSubmitted: boolean;
    rfq: {
        rfqNumber: string;
        lastDateSubmission: string;
        mrf: {
            mrfNumber: string;
            totalAmount: number;
            subsidiary: { name: string };
            mrfItems: MrfItem[];
        };
    };
    quotes: any[];
}

interface QuoteItem {
    rate: string;
    taxPercent: string;
    otherCharges: string;
    technicalDetails: string;
}

export default function VendorRfqPage() {
    const { token } = useParams() as { token: string };
    const [mapping, setMapping] = useState<VendorMapping | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [quoteItems, setQuoteItems] = useState<Record<string, QuoteItem>>({});
    const [deliveryDays, setDeliveryDays] = useState("");
    const [warranty, setWarranty] = useState("");
    const [terms, setTerms] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetch(`/api/vendor/rfq/${token}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) { setError(data.error); return; }
                setMapping(data.mapping);
                if (data.mapping.quoteSubmitted) setSubmitted(true);
                // Initialize quote items
                const init: Record<string, QuoteItem> = {};
                data.mapping.rfq.mrf.mrfItems.forEach((item: MrfItem) => {
                    init[item.itemId] = { rate: "", taxPercent: "0", otherCharges: "0", technicalDetails: "" };
                });
                setQuoteItems(init);
            })
            .catch(() => setError("Failed to load RFQ"))
            .finally(() => setLoading(false));
    }, [token]);

    function updateItem(itemId: string, field: string, value: string) {
        setQuoteItems((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const items = mapping!.rfq.mrf.mrfItems.map((mi) => ({
                itemId: mi.itemId,
                qty: mi.qty,
                ...(quoteItems[mi.itemId] ?? {}),
            }));

            const res = await fetch(`/api/vendor/rfq/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, deliveryDays, warranty, terms }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to submit"); return; }
            setSubmitted(true);
        } catch { setError("Network error"); }
        finally { setSubmitting(false); }
    }

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
            <p style={{ color: "#6b7280" }}>Loading RFQ...</p>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
            <div style={{ textAlign: "center", maxWidth: "400px", padding: "32px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#dc2626", marginBottom: "8px" }}>Access Error</h1>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>{error}</p>
            </div>
        </div>
    );

    if (submitted) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4" }}>
            <div style={{ textAlign: "center", maxWidth: "480px", padding: "32px", background: "white", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <CheckCircle size={54} style={{ color: "#16a34a", marginBottom: "16px" }} />
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#15803d", marginBottom: "8px" }}>Quote Submitted!</h1>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                    Your quotation for <strong>{mapping?.rfq.rfqNumber}</strong> has been submitted successfully.
                    The CPT will review and contact you.
                </p>
            </div>
        </div>
    );

    const mrf = mapping!.rfq.mrf;

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "24px 16px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ background: "#1e2a3a", color: "white", padding: "20px 24px", borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", gap: "12px" }}>
                    <ShoppingCart size={22} />
                    <div>
                        <div style={{ fontSize: "18px", fontWeight: 700 }}>Vendor Quotation Portal</div>
                        <div style={{ fontSize: "12px", color: "#a8b8cc" }}>RFQ: {mapping!.rfq.rfqNumber} | MRF: {mrf.mrfNumber}</div>
                    </div>
                </div>

                <div style={{ background: "white", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "24px" }}>
                    {/* Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px", fontSize: "13px" }}>
                        <div><span style={{ color: "#6b7280" }}>Vendor:</span> <strong>{mapping!.vendor.name}</strong></div>
                        <div><span style={{ color: "#6b7280" }}>Institution:</span> {mrf.subsidiary?.name}</div>
                        <div><span style={{ color: "#6b7280" }}>Submission Deadline:</span> <strong style={{ color: "#dc2626" }}>{formatDate(mapping!.rfq.lastDateSubmission)}</strong></div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
                            Item-wise Quotation
                        </h3>

                        <table className="erp-table" style={{ marginBottom: "20px" }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Description</th>
                                    <th>Qty</th>
                                    <th>Rate (₹) *</th>
                                    <th>Tax %</th>
                                    <th>Other (₹)</th>
                                    <th>Technical Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mrf.mrfItems.map((item, i) => (
                                    <tr key={item.itemId}>
                                        <td style={{ textAlign: "center" }}>{i + 1}</td>
                                        <td>
                                            <strong>{item.item.name}</strong>
                                            <div style={{ fontSize: "11px", color: "#6b7280" }}>{item.item.uom}</div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>{item.qty}</td>
                                        <td>
                                            <input type="number" className="form-input" value={quoteItems[item.itemId]?.rate || ""} onChange={e => updateItem(item.itemId, "rate", e.target.value)} required min="0" step="0.01" style={{ width: "80px" }} />
                                        </td>
                                        <td>
                                            <input type="number" className="form-input" value={quoteItems[item.itemId]?.taxPercent || "0"} onChange={e => updateItem(item.itemId, "taxPercent", e.target.value)} min="0" max="100" style={{ width: "60px" }} />
                                        </td>
                                        <td>
                                            <input type="number" className="form-input" value={quoteItems[item.itemId]?.otherCharges || "0"} onChange={e => updateItem(item.itemId, "otherCharges", e.target.value)} min="0" style={{ width: "70px" }} />
                                        </td>
                                        <td>
                                            <input className="form-input" value={quoteItems[item.itemId]?.technicalDetails || ""} onChange={e => updateItem(item.itemId, "technicalDetails", e.target.value)} placeholder="Specs / model..." style={{ width: "140px" }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                            <div className="form-group">
                                <label className="form-label">Delivery (days)</label>
                                <input type="number" className="form-input" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} placeholder="e.g. 7" min="1" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Warranty</label>
                                <input className="form-input" value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="e.g. 1 Year" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Terms</label>
                                <input className="form-input" value={terms} onChange={e => setTerms(e.target.value)} placeholder="e.g. 30 days net" />
                            </div>
                        </div>

                        {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", marginBottom: "16px" }}>{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px" }} disabled={submitting}>
                            {submitting ? "Submitting Quote..." : "Submit Quotation"}
                        </button>
                        <p style={{ fontSize: "11px", color: "#6b7280", textAlign: "center", marginTop: "8px" }}>
                            Once submitted, your quotation cannot be modified. Please review all entries carefully.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
