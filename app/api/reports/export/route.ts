import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (!type) {
            return new NextResponse("Report type is required", { status: 400 });
        }

        let data: any[] = [];
        let sheetName = "Report";

        switch (type) {
            case "mrf-status":
                sheetName = "MRF Status";
                const mrfs = await prisma.mrfMaster.findMany({
                    include: { subsidiary: true },
                    orderBy: { createdAt: "desc" },
                });
                data = mrfs.map((mrf) => ({
                    "MRF Number": mrf.mrfNumber,
                    "Subsidiary Code": mrf.subsidiary.code,
                    "Subsidiary Name": mrf.subsidiary.name,
                    "Status": mrf.status,
                    "Created Date": mrf.createdAt.toLocaleDateString(),
                    "Total Amount (Est)": mrf.totalAmount || 0,
                    "Approval Remarks": mrf.remarks || "",
                }));
                break;

            case "vendor-quotes":
                sheetName = "Vendor Quotations";
                const quotes = await prisma.vendorQuoteItem.findMany({
                    include: {
                        mapping: { include: { rfq: true } },
                        vendor: true,
                        item: true,
                    },
                    orderBy: [{ rfqId: "desc" }, { vendorId: "asc" }],
                });
                data = quotes.map((q) => ({
                    "RFQ Number": q.mapping.rfq.rfqNumber,
                    "Vendor": q.vendor.name,
                    "Item": q.item.name,
                    "Per Unit Rate": q.rate,
                    "Total Value": q.totalAmount,
                    "Lead Time (Days)": q.deliveryDays || "N/A",
                    "Remarks": q.technicalDetails || "",
                }));
                break;

            case "po-tracking":
                sheetName = "Purchase Orders";
                const pos = await prisma.poMaster.findMany({
                    include: { vendor: true, mrf: { include: { subsidiary: true } } },
                    orderBy: { createdAt: "desc" },
                });
                data = pos.map((po) => ({
                    "PO Number": po.poNumber,
                    "MRF Source": po.mrf.mrfNumber,
                    "Subsidiary": po.mrf.subsidiary.name,
                    "Vendor": po.vendor.name,
                    "Status": po.status,
                    "Total Amount": po.totalAmount,
                    "Created Date": po.createdAt.toLocaleDateString(),
                }));
                break;

            case "stock-ledger":
                sheetName = "Stock Ledger";
                const items = await prisma.stkItemMaster.findMany({
                    include: { category: true, group: true, manufacturer: true },
                    orderBy: { name: "asc" },
                });
                data = items.map((item) => ({
                    "Item Name": item.name,
                    "Category": item.category?.name || "N/A",
                    "Group": item.group?.name || "N/A",
                    "Manufacturer": item.manufacturer?.name || "N/A",
                    "Current Qty": item.currentQty,
                    "UOM": item.uom,
                    "Reorder Level": item.reorderLevel,
                    "Stock Status": item.currentQty <= item.reorderLevel ? "Low Stock" : "Healthy",
                }));
                break;

            case "payments":
                sheetName = "Payments";
                const payments = await prisma.paymentDetails.findMany({
                    include: { po: { include: { vendor: true, mrf: { include: { subsidiary: true } } } } },
                    orderBy: { paymentDate: "desc" },
                });
                data = payments.map((p) => ({
                    "PO Number": p.po.poNumber,
                    "Vendor": p.po.vendor.name,
                    "Subsidiary": p.po.mrf.subsidiary.name,
                    "Paid Amount": p.amountPaid,
                    "Payment Mode": p.paymentMode || "N/A",
                    "Reference No": p.referenceNo || "",
                    "Payment Date": p.paymentDate.toLocaleDateString(),
                }));
                break;

            default:
                return new NextResponse("Invalid report type", { status: 400 });
        }

        // Generate Excel Buffer
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(excelBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx"`,
            },
        });
    } catch (error: any) {
        console.error("Export error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
