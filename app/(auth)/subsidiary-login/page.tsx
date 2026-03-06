"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Building2 } from "lucide-react";

type Step = "details" | "otp";

export default function SubsidiaryLoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("details");
    const [form, setForm] = useState({ code: "", mobile: "" });
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [subsidiaryId, setSubsidiaryId] = useState("");

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/subsidiary-otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: form.code, mobile: form.mobile }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to send OTP");
                return;
            }
            setSubsidiaryId(data.subsidiaryId);
            setStep("otp");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/subsidiary-otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subsidiaryId, mobile: form.mobile, code: otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Invalid OTP");
                return;
            }
            window.location.href = "/subsidiary/mrf";
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 100%)" }}
        >
            <div style={{ width: "100%", maxWidth: "400px", padding: "0 16px" }}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3"
                        style={{ background: "#16a34a" }}
                    >
                        <Building2 size={24} className="text-white" />
                    </div>
                    <h1 className="text-white text-2xl font-bold">Subsidiary Login</h1>
                    <p className="text-green-300 text-sm mt-1">Institution Portal</p>
                </div>

                <div className="card" style={{ padding: "28px" }}>
                    {step === "details" ? (
                        <>
                            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>
                                Enter Institution Details
                            </h2>
                            <form onSubmit={handleSendOtp}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="inst-code">Institution Code</label>
                                    <input
                                        id="inst-code"
                                        type="text"
                                        className="form-input"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. INST001"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="mobile">Registered Mobile</label>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        className="form-input"
                                        value={form.mobile}
                                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                        placeholder="10-digit mobile number"
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", marginBottom: "14px" }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    style={{ width: "100%", justifyContent: "center", padding: "9px" }}
                                    disabled={loading}
                                >
                                    {loading ? "Sending OTP..." : "Send OTP"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
                                Enter OTP
                            </h2>
                            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "20px" }}>
                                OTP sent to {form.mobile}. In dev mode, use <strong>123456</strong>.
                            </p>
                            <form onSubmit={handleVerifyOtp}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="otp">6-Digit OTP</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        className="form-input"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        required
                                        style={{ letterSpacing: "0.3em", fontSize: "18px", textAlign: "center" }}
                                    />
                                </div>

                                {error && (
                                    <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#dc2626", fontSize: "12px", marginBottom: "14px" }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    style={{ width: "100%", justifyContent: "center", padding: "9px" }}
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep("details"); setError(""); setOtp(""); }}
                                    className="btn btn-secondary"
                                    style={{ width: "100%", justifyContent: "center", padding: "9px", marginTop: "8px" }}
                                >
                                    ← Back
                                </button>
                            </form>
                        </>
                    )}

                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <a href="/login" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none" }}>
                            CPT Staff Login →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
