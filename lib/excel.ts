import * as XLSX from "xlsx";

export interface ExcelColumn {
    header: string;
    key: string;
    width?: number;
}

/**
 * Generate Excel file buffer from data
 */
export function generateExcel(
    data: Record<string, any>[],
    columns: ExcelColumn[],
    sheetName: string = "Report"
): Buffer {
    const worksheetData = [
        columns.map((col) => col.header),
        ...data.map((row) => columns.map((col) => row[col.key] ?? "")),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet["!cols"] = columns.map((col) => ({ wch: col.width || 20 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

/**
 * Parse Excel file to JSON
 */
export function parseExcel(buffer: Buffer): Record<string, any>[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as Record<string, any>[];
}
