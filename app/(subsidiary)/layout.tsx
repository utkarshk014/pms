import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Subsidiary Portal — PMS",
};

export default function SubsidiaryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
            {/* Top bar */}
            <header
                style={{
                    background: "#1e2a3a",
                    color: "white",
                    padding: "0 24px",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                        style={{
                            width: "28px",
                            height: "28px",
                            background: "#3b82f6",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                        }}
                    >
                        🏢
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>Subsidiary Portal</span>
                    <span style={{ fontSize: "11px", color: "#6b8aaa", marginLeft: "4px" }}>
                        Procurement Management System
                    </span>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <a
                        href="/api/auth/subsidiary-otp/logout"
                        style={{ fontSize: "12px", color: "#a8b8cc", textDecoration: "none" }}
                    >
                        Sign Out
                    </a>
                </div>
            </header>

            {/* Page content */}
            <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>{children}</main>
        </div>
    );
}
