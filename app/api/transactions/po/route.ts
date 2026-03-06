import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generatePoNumber } from "@/lib/utils";
import { emailService } from "@/lib/email";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const pos = await prisma.poMaster.findMany({
            include: {
                mrf: { include: { subsidiary: { select: { name: true } } } },
                vendor: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ pos });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { mrfId, vendorId, totalAmount, deliveryPeriod, paymentTerms, termsConditions } = body;

        if (!mrfId || !vendorId) return NextResponse.json({ error: "MRF and vendor are required" }, { status: 400 });

        const count = await prisma.poMaster.count();
        const poNumber = generatePoNumber(count + 1);

        const po = await prisma.poMaster.create({
            data: {
                mrfId,
                vendorId,
                poNumber,
                totalAmount: parseFloat(totalAmount) || 0,
                deliveryPeriod,
                paymentTerms,
                termsConditions,
                status: "ISSUED",
            },
        });

        // Update MRF status
        await prisma.mrfMaster.update({ where: { id: mrfId }, data: { status: "PO_ISSUED" } });

        const vendor = await prisma.mstVendor.findUnique({ where: { id: vendorId } });

        // Generate the PDF by calling our own internal endpoint
        let pdfBuffer: Buffer | undefined;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const pdfRes = await fetch(`${baseUrl}/api/transactions/po/${po.id}/pdf`);
            if (pdfRes.ok) {
                const arrayBuffer = await pdfRes.arrayBuffer();
                pdfBuffer = Buffer.from(arrayBuffer);
            } else {
                console.error("Failed to generate PDF locally during PO creation", await pdfRes.text());
            }
        } catch (pdfErr) {
            console.error("Error generating PDF locally:", pdfErr);
        }

        // Send Email to vendor with PDF appended
        if (vendor?.email) {
            await emailService.sendPOEmail({
                to: vendor.email,
                vendorName: vendor.name,
                poNumber,
                totalAmount: parseFloat(totalAmount) || 0,
                pdfBuffer
            });
        }

        return NextResponse.json({ po }, { status: 201 });
    } catch (error) {
        console.error("Create PO error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
