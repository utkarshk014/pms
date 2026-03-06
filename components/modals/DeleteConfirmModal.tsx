"use client";

import { X } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
    loading?: boolean;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    loading = false,
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                style={{ maxWidth: "400px" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <span className="modal-title" style={{ color: "#dc2626" }}>Confirm Delete</span>
                    <button
                        onClick={onClose}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: "14px", color: "#374151" }}>
                        Are you sure you want to delete{" "}
                        {itemName ? (
                            <strong>&ldquo;{itemName}&rdquo;</strong>
                        ) : (
                            "this record"
                        )}
                        ?
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                        This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={loading} id="btn-confirm-delete">
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
