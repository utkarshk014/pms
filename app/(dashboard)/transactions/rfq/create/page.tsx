"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Send, CheckSquare, Square } from "lucide-react";

interface MrfDetail {
    id: string;
    mrfNumber: string;
    status: string;
    remarks: string;
    subsidiary: { name: string };
    mrfItems: { qty: number; expectedRate: number; item: { name: string; uom: string } }[];
}

interface Vendor {
    id: string;
    name: string;
    email: string;
    contactPerson: string;
    mobile: string;
}

function CreateRfqInner() {
    const router = useRouter();
    const params = useSearchParams();
    const mrfId = params.get("mrfId");

    const [mrf, setMrf] = useState<MrfDetail | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchData = useCallback(async () => {
        if (!mrfId) return;
        try {
            const [mrfRes, vendorRes] = await Promise.all([
                fetch(`/api/transactions/mrf/${mrfId}`),
                fetch("/api/masters/vendors"),
            ]);
            const mrfData = await mrfRes.json();
            const vendorData = await vendorRes.json();
            setMrf(mrfData.mrf || null);
            setVendors(vendorData.vendors || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [mrfId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    function toggleVendor(id: string) {
        setSelectedVendors(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function selectAll() {
        setSelectedVendors(new Set(vendors.map(v => v.id)));
    }

    async function handleCreate() {
        setError("");
        if (selectedVendors.size === 0) { setError("Select at least one vendor"); return; }
        if (!deadline) { setError("Please set a quote submission deadline"); return; }

        setSubmitting(true);
        try {
            const res = await fetch("/api/transactions/rfq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mrfId,
                    vendorIds: Array.from(selectedVendors),
                    lastDateSubmission: deadline,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to create RFQ"); return; }
            // Success → go to RFQ list
            router.push("/transactions/rfq");
        } catch { setError("Network error"); }
        finally { setSubmitting(false); }
    }

    if (!mrfId) return (
        <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
            No MRF ID provided. Go back to <a href="/transactions/mrf" style={{ color: "#2563eb" }}>MRF list</a>.
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <TopBar title="Create RFQ" breadcrumb={["Transactions", "RFQ", "Create"]} />
            <div style={{ flex: 1, margin: "16px", overflowY: "auto" }}>

                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading MRF details...</div>
                ) : !mrf ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>MRF not found or not accessible.</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "1100px" }}>

                        {/* ── Left: MRF Summary ── */}
                        <div>
                            <div className="data-card" style={{ marginBottom: "12px" }}>
                                <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                                    MRF Summary
                                </div>
                                <div style={{ padding: "16px", fontSize: "13px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                                        <div><span style={{ color: "#6b7280" }}>MRF No: </span><strong>{mrf.mrfNumber}</strong></div>
                                        <div><span style={{ color: "#6b7280" }}>Institution: </span>{mrf.subsidiary?.name}</div>
                                        {mrf.remarks && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#6b7280" }}>Remarks: </span>{mrf.remarks}</div>}
                                    </div>
                                    <table className="erp-table">
                                        <thead>
                                            <tr><th>#</th><th>Item</th><th>UOM</th><th>Qty</th><th>Rate (₹)</th></tr>
                                        </thead>
                                        <tbody>
                                            {mrf.mrfItems.map((mi, i) => (
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

                            {/* Deadline */}
                            <div className="data-card">
                                <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                                    Quote Submission Deadline
                                </div>
                                <div style={{ padding: "16px" }}>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={deadline}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={e => setDeadline(e.target.value)}
                                        style={{ maxWidth: "200px" }}
                                    />
                                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                                        Vendors must submit their quotes before this date.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Vendor Selection ── */}
                        <div className="data-card">
                            <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                                    Select Vendors ({selectedVendors.size} selected)
                                </span>
                                <button className="btn btn-secondary btn-sm" onClick={selectAll}>Select All</button>
                            </div>
                            <div style={{ padding: "8px 0" }}>
                                {vendors.length === 0 ? (
                                    <div style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
                                        No vendors found. <a href="/masters/vendors" style={{ color: "#2563eb" }}>Add vendors first</a>.
                                    </div>
                                ) : vendors.map(vendor => {
                                    const selected = selectedVendors.has(vendor.id);
                                    return (
                                        <div
                                            key={vendor.id}
                                            onClick={() => toggleVendor(vendor.id)}
                                            style={{
                                                padding: "12px 16px",
                                                borderBottom: "1px solid #f3f4f6",
                                                cursor: "pointer",
                                                background: selected ? "#eff6ff" : "white",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                transition: "background 0.1s",
                                            }}
                                        >
                                            {selected
                                                ? <CheckSquare size={18} style={{ color: "#2563eb", flexShrink: 0 }} />
                                                : <Square size={18} style={{ color: "#9ca3af", flexShrink: 0 }} />
                                            }
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: "13px", color: "#111827" }}>{vendor.name}</div>
                                                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                                                    {vendor.email || "No email"} {vendor.contactPerson ? `· ${vendor.contactPerson}` : ""}
                                                </div>
                                            </div>
                                            {!vendor.email && (
                                                <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px" }}>
                                                    No email
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}

                {/* Action Bar */}
                {!loading && mrf && (
                    <div style={{ maxWidth: "1100px", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>
                            <ArrowLeft size={14} /> Back
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {error && <span style={{ fontSize: "12px", color: "#dc2626" }}>{error}</span>}
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={submitting || selectedVendors.size === 0 || !deadline}
                            >
                                <Send size={14} />
                                {submitting ? "Creating RFQ..." : `Send RFQ to ${selectedVendors.size} Vendor${selectedVendors.size !== 1 ? "s" : ""}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CreateRfqPage() {
    return (
        <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
            <CreateRfqInner />
        </Suspense>
    );
}
