"use client";

import { useState, useEffect } from "react";
import { X, Lock, CheckCircle, RefreshCw } from "lucide-react";

interface OtpVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<boolean>;
    onResend: () => Promise<void>;
    loading: boolean;
}

export function OtpVerificationModal({ isOpen, onClose, onVerify, onResend, loading }: OtpVerificationModalProps) {
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [error, setError] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setOtp("");
            setError("");
            setSuccess(false);
            setTimeLeft(60);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || timeLeft <= 0 || success) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [isOpen, timeLeft, success]);

    if (!isOpen) return null;

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (otp.length !== 6) {
            setError("OTP must be exactly 6 digits.");
            return;
        }

        const isValid = await onVerify(otp);
        if (isValid) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError("Invalid or expired OTP. Please try again.");
        }
    }

    async function handleResend() {
        setError("");
        setIsResending(true);
        try {
            await onResend();
            setTimeLeft(60); // reset counter
            setOtp("");
        } catch (err: any) {
            setError(err.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: "400px", textAlign: "center", padding: "32px 24px" }}>
                <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", border: "none", background: "none", cursor: loading ? "not-allowed" : "pointer", color: "#6b7280" }} disabled={loading}>
                    <X size={20} />
                </button>

                {success ? (
                    <div style={{ padding: "20px 0" }}>
                        <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 16px" }} />
                        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>Verified!</h2>
                        <p style={{ color: "#6b7280", fontSize: "14px" }}>MRF submitted successfully.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <Lock size={24} color="#3b82f6" />
                        </div>
                        <h2 className="modal-title" style={{ fontSize: "20px", marginBottom: "8px" }}>Enter Code</h2>
                        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
                            We sent a 6-digit confirmation code to your registered email address.
                        </p>

                        <form onSubmit={handleVerify}>
                            <input
                                autoFocus
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                                style={{
                                    width: "100%",
                                    textAlign: "center",
                                    fontSize: "24px",
                                    letterSpacing: "4px",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    marginBottom: "16px",
                                    fontWeight: 600
                                }}
                                placeholder="------"
                                disabled={loading}
                            />

                            {error && (
                                <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px", background: "#fef2f2", padding: "8px", borderRadius: "4px" }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: "100%", padding: "10px", fontSize: "15px", marginBottom: "16px" }}
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? "Verifying..." : "Confirm & Submit MRF"}
                            </button>
                        </form>

                        <div style={{ fontSize: "14px", color: "#4b5563", marginTop: "16px" }}>
                            {timeLeft > 0 ? (
                                <span>Resend code in <strong>0:{timeLeft.toString().padStart(2, '0')}</strong></span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", gap: "6px" }}
                                    disabled={isResending}
                                >
                                    <RefreshCw size={14} className={isResending ? "animate-spin" : ""} />
                                    {isResending ? "Sending..." : "Resend OTP"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
