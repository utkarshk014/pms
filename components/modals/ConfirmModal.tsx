"use client";

import { X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onClose,
    onConfirm,
    loading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                style={{ maxWidth: "420px" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <span className="modal-title" style={{ color: "#111827" }}>{title}</span>
                    <button
                        onClick={onClose}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>
                        {message}
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>
                        {loading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
