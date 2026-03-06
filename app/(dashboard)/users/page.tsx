"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCog, Plus, Edit, Trash2 } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    ADMIN: { bg: "#fee2e2", color: "#991b1b" },
    STAFF: { bg: "#dbeafe", color: "#1d4ed8" },
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage CPT staff accounts and permissions</p>
                </div>
                <button className="btn btn-primary btn-sm" disabled title="Coming soon">
                    <Plus size={14} />
                    Add User
                </button>
            </div>

            <div className="data-card">
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading...</div>
                ) : users.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <UserCog size={48} style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No users found</p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            User creation coming soon. For now, use the seed script to create users.
                        </p>
                    </div>
                ) : (
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, i) => {
                                const roleColor = ROLE_COLORS[user.role] || { bg: "#f3f4f6", color: "#374151" };
                                return (
                                    <tr key={user.id}>
                                        <td style={{ textAlign: "center" }}>{i + 1}</td>
                                        <td><strong>{user.name}</strong></td>
                                        <td style={{ color: "#4b5563" }}>{user.email}</td>
                                        <td>{user.mobile}</td>
                                        <td>
                                            <span className="status-badge" style={{ background: roleColor.bg, color: roleColor.color }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={user.isActive ? { background: "#dcfce7", color: "#166534" } : { background: "#fef2f2", color: "#991b1b" }}>
                                                {user.isActive ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </td>
                                        <td style={{ display: "flex", gap: "4px" }}>
                                            <button className="btn btn-sm btn-secondary" title="Edit" disabled>
                                                <Edit size={13} />
                                            </button>
                                            <button className="btn btn-sm btn-danger" title="Delete" disabled>
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
