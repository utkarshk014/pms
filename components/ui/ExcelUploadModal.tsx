"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { X, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface ExcelUploadModalProps {
    title: string;
    templateName: string;
    expectedColumns: string[];
    onClose: () => void;
    onUpload: (data: any[]) => Promise<void>;
}

export function ExcelUploadModal({ title, templateName, expectedColumns, onClose, onUpload }: ExcelUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.aoa_to_sheet([expectedColumns]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, `${templateName}.xlsx`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (!selected.name.endsWith(".xlsx") && !selected.name.endsWith(".csv")) {
            setError("Please upload a valid .xlsx or .csv file");
            return;
        }

        setFile(selected);
        setError("");
    };

    const handleProcess = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Check headers explicitly
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (!json || json.length < 2) {
                throw new Error("File appears to be empty or missing data rows.");
            }

            const headers = json[0] as string[];
            const missingVars = expectedColumns.filter(col => !headers.includes(col));
            if (missingVars.length > 0) {
                throw new Error(`Missing required columns: ${missingVars.join(", ")}`);
            }

            // Convert to JSON object array properly map keys
            const rowData: any[] = XLSX.utils.sheet_to_json(worksheet);

            await onUpload(rowData);
        } catch (err: any) {
            setError(err.message || "Failed to process the Excel file.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: "500px" }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="btn btn-secondary btn-sm" style={{ padding: "4px" }} onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px dashed #e5e7eb" }}>
                        <div style={{ fontSize: "13px", color: "#4b5563" }}>
                            <strong>Step 1:</strong> Download the exact template required for the upload.
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate}>
                            <FileSpreadsheet size={14} style={{ marginRight: "6px" }} />
                            Download Template
                        </button>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: "8px" }}>
                            <strong>Step 2:</strong> Fill the template and upload it here.
                        </div>

                        <input
                            type="file"
                            accept=".xlsx, .csv"
                            style={{ display: "none" }}
                            ref={fileRef}
                            onChange={handleFileChange}
                        />

                        <div
                            onClick={() => fileRef.current?.click()}
                            style={{
                                border: "2px dashed #d1d5db",
                                borderRadius: "8px",
                                padding: "30px",
                                textAlign: "center",
                                cursor: "pointer",
                                background: file ? "#eff6ff" : "#fff",
                                borderColor: file ? "#3b82f6" : "#d1d5db",
                                transition: "all 0.2s"
                            }}
                        >
                            {file ? (
                                <div>
                                    <FileSpreadsheet size={32} color="#3b82f6" style={{ margin: "0 auto 10px" }} />
                                    <div style={{ fontWeight: 600, color: "#1e3a8a" }}>{file.name}</div>
                                    <div style={{ fontSize: "12px", color: "#60a5fa", marginTop: "4px" }}>{(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={32} color="#9ca3af" style={{ margin: "0 auto 10px" }} />
                                    <div style={{ fontWeight: 600, color: "#4b5563" }}>Click to select Excel file</div>
                                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>.xlsx or .csv up to 5MB</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px", marginBottom: "20px" }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleProcess}
                        disabled={!file || loading}
                    >
                        {loading ? "Processing..." : "Upload & Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
