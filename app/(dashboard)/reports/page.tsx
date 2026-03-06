"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart2, FileText, ShoppingCart, Package, IndianRupee, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
    totalMrfs: number;
    pendingMrfs: number;
    approvedMrfs: number;
    totalVendors: number;
    totalSubsidiaries: number;
    totalStockItems: number;
}

export default function ReportsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/dashboard");
            const data = await res.json();
            setStats(data.stats);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const reportCards = [
        {
            title: "MRF Summary Report",
            description: "All MRFs grouped by status, institution, and date range",
            icon: FileText,
            color: "#2563eb",
            bg: "#dbeafe",
            available: true,
            type: "mrf-status"
        },
        {
            title: "Vendor Quotation Report",
            description: "Comparative analysis of vendor quotes (L1/L2/L3)",
            icon: ShoppingCart,
            color: "#7c3aed",
            bg: "#ede9fe",
            available: true,
            type: "vendor-quotes"
        },
        {
            title: "Purchase Order Report",
            description: "POs issued, delivery status and payment tracking",
            icon: Package,
            color: "#059669",
            bg: "#d1fae5",
            available: true,
            type: "po-tracking"
        },
        {
            title: "Stock Ledger",
            description: "Item-wise stock movement — inward, consumption, balance",
            icon: BarChart2,
            color: "#d97706",
            bg: "#fef3c7",
            available: true,
            type: "stock-ledger"
        },
        {
            title: "Payment Tracking",
            description: "Outstanding and completed payments to vendors",
            icon: IndianRupee,
            color: "#dc2626",
            bg: "#fee2e2",
            available: true,
            type: "payments"
        },
    ];

    const handleDownload = (type: string) => {
        window.open(`/api/reports/export?type=${type}`, '_blank');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports</h1>
                    <p className="page-subtitle">Export and analyze procurement data</p>
                </div>
            </div>

            {/* Quick Stats */}
            {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                    {[
                        { label: "Total MRFs", value: stats.totalMrfs },
                        { label: "Pending Approval", value: stats.pendingMrfs },
                        { label: "Active Vendors", value: stats.totalVendors },
                        { label: "Subsidiaries", value: stats.totalSubsidiaries },
                    ].map(s => (
                        <div key={s.label} className="data-card" style={{ padding: "16px", textAlign: "center", marginBottom: 0 }}>
                            <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>{s.value}</div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {reportCards.map((card) => (
                    <div
                        key={card.title}
                        className="data-card"
                        style={{ padding: "20px", marginBottom: 0, opacity: card.available ? 1 : 0.7 }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <card.icon size={20} style={{ color: card.color }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{card.title}</div>
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", lineHeight: "1.4" }}>{card.description}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                            <button
                                className="btn btn-sm btn-secondary"
                                disabled={!card.available}
                                onClick={() => card.available && card.type && handleDownload(card.type)}
                                style={{ flex: 1, justifyContent: "center", opacity: card.available ? 1 : 0.5, cursor: card.available ? "pointer" : "not-allowed" }}
                                title={card.available ? "Export to Excel" : "Coming soon"}
                            >
                                <Download size={12} />
                                Excel
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
