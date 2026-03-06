import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

/**
 * Format datetime
 */
export function formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Generate MRF number: MRF-YYYY-NNNN
 */
export function generateMrfNumber(sequenceNumber: number): string {
    const year = new Date().getFullYear();
    const seq = String(sequenceNumber).padStart(4, "0");
    return `MRF-${year}-${seq}`;
}

/**
 * Generate RFQ number
 */
export function generateRfqNumber(sequenceNumber: number): string {
    const year = new Date().getFullYear();
    const seq = String(sequenceNumber).padStart(4, "0");
    return `RFQ-${year}-${seq}`;
}

/**
 * Generate PO number
 */
export function generatePoNumber(sequenceNumber: number): string {
    const year = new Date().getFullYear();
    const seq = String(sequenceNumber).padStart(4, "0");
    return `PO-${year}-${seq}`;
}

/**
 * Calculate line item total
 */
export function calculateLineTotal(
    qty: number,
    rate: number,
    taxPercent: number,
    otherCharges: number
): number {
    const baseAmount = qty * rate;
    const taxAmount = (baseAmount * taxPercent) / 100;
    return baseAmount + taxAmount + otherCharges;
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-700",
        SUBMITTED: "bg-blue-100 text-blue-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
        RFQ_SENT: "bg-purple-100 text-purple-700",
        PO_ISSUED: "bg-orange-100 text-orange-700",
        CLOSED: "bg-gray-200 text-gray-600",
        OPEN: "bg-blue-100 text-blue-700",
        ISSUED: "bg-yellow-100 text-yellow-700",
        DELIVERED: "bg-green-100 text-green-700",
        COMPLETED: "bg-green-200 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-700",
        PARTIAL: "bg-orange-100 text-orange-700",
        PAID: "bg-green-100 text-green-700",
        ADMIN: "bg-indigo-100 text-indigo-700",
        STAFF: "bg-cyan-100 text-cyan-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
}
