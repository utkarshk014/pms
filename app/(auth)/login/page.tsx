"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });
            if (res?.error) {
                setError("Invalid email or password.");
            } else {
                router.push("/dashboard");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1e2a3a 0%, #2d4a6b 100%)" }}
        >
            <div style={{ width: "100%", maxWidth: "400px", padding: "0 16px" }}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3"
                        style={{ background: "#2563eb" }}
                    >
                        <ShoppingCart size={24} className="text-white" />
                    </div>
                    <h1 className="text-white text-2xl font-bold">PMS</h1>
                    <p className="text-blue-300 text-sm mt-1">Procurement Management System</p>
                </div>

                {/* Login Card */}
                <div className="card" style={{ padding: "28px" }}>
                    <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>
                        CPT Staff Login
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="admin@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: "36px" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6b7280",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                style={{
                                    padding: "8px 12px",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    borderRadius: "4px",
                                    color: "#dc2626",
                                    fontSize: "12px",
                                    marginBottom: "14px",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center", padding: "9px" }}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div style={{ marginTop: "20px", padding: "12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "4px" }}>
                        <p style={{ fontSize: "11px", color: "#0369a1", fontWeight: 600 }}>Demo Credentials</p>
                        <p style={{ fontSize: "11px", color: "#0284c7", marginTop: "2px" }}>Email: admin@pms.local</p>
                        <p style={{ fontSize: "11px", color: "#0284c7" }}>Password: Admin@123</p>
                    </div>

                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <a
                            href="/subsidiary-login"
                            style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}
                        >
                            Subsidiary Institution Login →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
