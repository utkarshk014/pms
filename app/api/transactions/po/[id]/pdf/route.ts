import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const po = await prisma.poMaster.findUnique({
            where: { id },
            include: {
                vendor: true,
                mrf: {
                    include: {
                        subsidiary: true,
                        mrfItems: {
                            include: { item: true }
                        }
                    }
                }
            }
        });

        if (!po) return new NextResponse("PO Not Found", { status: 404 });

        // Get the quoted prices from vendor quoting mapping to show exact rates
        const quotes = await prisma.vendorQuoteItem.findMany({
            where: {
                vendorId: po.vendorId,
                mapping: { rfq: { mrfId: po.mrfId } }
            }
        });

        const quotesMap = new Map(quotes.map(q => [q.itemId, q]));

        // Generate HTML for the PDF
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; font-size: 14px; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 28px; font-weight: bold; color: #2563eb; margin: 0; }
                .meta { text-align: right; font-size: 14px; color: #666; }
                .grid-2 { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .box { border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; width: 45%; background: #f9fafb; }
                h3 { margin-top: 0; font-size: 16px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #f3f4f6; text-align: left; padding: 12px; font-weight: 600; border: 1px solid #e5e7eb; }
                td { padding: 12px; border: 1px solid #e5e7eb; }
                .total-row { font-weight: bold; background: #f9fafb; }
                .text-right { text-align: right; }
                .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1 class="title">PURCHASE ORDER</h1>
                    <div style="margin-top: 5px; color: #666;">Generated on ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="meta">
                    <strong>PO Number:</strong> ${po.poNumber}<br>
                    <strong>MRF Ref:</strong> ${po.mrf.mrfNumber}<br>
                    <strong>Date Issued:</strong> ${po.createdAt.toLocaleDateString()}
                </div>
            </div>

            <div class="grid-2">
                <div class="box">
                    <h3>Vendor Details</h3>
                    <strong>${po.vendor.name}</strong><br>
                    ${po.vendor.address || 'Address not provided'}<br>
                    Email: ${po.vendor.email || 'N/A'}<br>
                    Contact: ${po.vendor.mobile || 'N/A'}<br>
                    GSTIN: ${po.vendor.gstNo || 'N/A'}
                </div>
                <div class="box">
                    <h3>Delivery To (Subsidiary)</h3>
                    <strong>${po.mrf.subsidiary.name}</strong><br>
                    ${po.mrf.subsidiary.address || ''} ${po.mrf.subsidiary.city || ''}<br>
                    Contact: ${po.mrf.subsidiary.mobile}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Item Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Rate (₹)</th>
                        <th class="text-right">Tax (%)</th>
                        <th class="text-right">Total (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${po.mrf.mrfItems.map((mrfItem, index) => {
            const quote = quotesMap.get(mrfItem.itemId);
            const rate = quote?.rate || mrfItem.expectedRate || 0;
            const tax = quote?.taxPercent || 0;
            const rowTotal = quote?.totalAmount || rate * mrfItem.qty;

            return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                <strong>${mrfItem.item.name}</strong>
                                ${quote?.technicalDetails ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">Specs: ${quote.technicalDetails}</div>` : ''}
                            </td>
                            <td class="text-right">${mrfItem.qty} ${mrfItem.item.uom}</td>
                            <td class="text-right">${rate.toFixed(2)}</td>
                            <td class="text-right">${tax}%</td>
                            <td class="text-right">${rowTotal.toFixed(2)}</td>
                        </tr>`;
        }).join('')}
                    <tr class="total-row">
                        <td colspan="5" class="text-right" style="font-size: 16px;">Grand Total</td>
                        <td class="text-right" style="font-size: 16px; color: #2563eb;">₹ ${po.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>

            <div class="box" style="width: auto; background: #fff;">
                <h3>Terms & Conditions</h3>
                <p style="margin: 0; white-space: pre-wrap; font-size: 13px; color: #4b5563;">${po.termsConditions || '1. Delivery within standard lead time.\n2. Payment as per standard terms.'}</p>
                <div style="margin-top: 15px;">
                    <strong>Delivery Period:</strong> ${po.deliveryPeriod || 'N/A'}<br>
                    <strong>Payment Terms:</strong> ${po.paymentTerms || 'N/A'}
                </div>
            </div>

            <div class="footer">
                This is a computer-generated document. No signature is required.
            </div>
        </body>
        </html>
        `;

        // Launch puppeteer to generate PDF
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
        });
        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="PO_${po.poNumber}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error("PDF generation error:", error);
        return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
    }
}
