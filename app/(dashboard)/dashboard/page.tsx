"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import {
    FileText,
    Building2,
    Package,
    CheckCircle,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";

interface DashboardStats {
    totalMrfs: number;
    pendingMrfs: number;
    approvedMrfs: number;
    closedMrfs: number;
    totalVendors: number;
    totalSubsidiaries: number;
    totalStockItems: number;
    lowStockItems: number;
}

interface RecentMrf {
    id: string;
    mrfNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    subsidiary: { name: string };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentMrfs, setRecentMrfs] = useState<RecentMrf[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard")
            .then((r) => r.json())
            .then((data) => {
                setStats(data.stats);
                setRecentMrfs(data.recentMrfs || []);
            })
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { label: "Total MRFs", value: stats?.totalMrfs ?? 0, icon: FileText, color: "#2563eb", bg: "#eff6ff" },
        { label: "Pending Review", value: stats?.pendingMrfs ?? 0, icon: AlertTriangle, color: "#d97706", bg: "#fffbeb" },
        { label: "Active Vendors", value: stats?.totalVendors ?? 0, icon: Package, color: "#16a34a", bg: "#f0fdf4" },
        { label: "Subsidiaries", value: stats?.totalSubsidiaries ?? 0, icon: Building2, color: "#7c3aed", bg: "#faf5ff" },
        { label: "Stock Items", value: stats?.totalStockItems ?? 0, icon: Package, color: "#0891b2", bg: "#ecfeff" },
        { label: "MRFs Closed", value: stats?.closedMrfs ?? 0, icon: CheckCircle, color: "#16a34a", bg: "#f0fdf4" },
    ];

    return (
        <div>
            <TopBar title="Dashboard" breadcrumb={["Dashboard"]} />
            <div style={{ padding: "20px" }}>
                {loading ? (
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading dashboard...</p>
                ) : (
                    <>
                        {/* Stat cards */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                gap: "14px",
                                marginBottom: "24px",
                            }}
                        >
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="card"
                                    style={{ padding: "16px", borderLeft: `3px solid ${card.color}` }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div
                                                style={{ fontSize: "28px", fontWeight: 800, color: card.color, lineHeight: "1" }}
                                            >
                                                {card.value}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{card.label}</div>
                                        </div>
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "8px",
                                                background: card.bg,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <card.icon size={18} style={{ color: card.color }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent MRFs */}
                        <div className="card">
                            <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>
                                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                                    Recent Material Requisitions
                                </h2>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="erp-table">
                                    <thead>
                                        <tr>
                                            <th>MRF Number</th>
                                            <th>Subsidiary</th>
                                            <th>Status</th>
                                            <th>Total Amount</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentMrfs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                                                    No MRFs created yet
                                                </td>
                                            </tr>
                                        ) : (
                                            recentMrfs.map((mrf) => (
                                                <tr key={mrf.id}>
                                                    <td>
                                                        <strong style={{ color: "#2563eb" }}>{mrf.mrfNumber}</strong>
                                                    </td>
                                                    <td>{mrf.subsidiary?.name}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusColor(mrf.status)}`}>{mrf.status}</span>
                                                    </td>
                                                    <td>{formatCurrency(mrf.totalAmount)}</td>
                                                    <td>{formatDate(mrf.createdAt)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
