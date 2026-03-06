import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET vendor portal data via secure token
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;

        const mapping = await prisma.rfqVendorMapping.findUnique({
            where: { secureToken: token },
            include: {
                vendor: true,
                rfq: {
                    include: {
                        mrf: {
                            include: {
                                mrfItems: { include: { item: true } },
                                subsidiary: { select: { name: true } },
                            },
                        },
                    },
                },
                quotes: true,
            },
        });

        if (!mapping) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });

        // Check expiry
        if (mapping.tokenExpiresAt && new Date() > mapping.tokenExpiresAt) {
            return NextResponse.json({ error: "This RFQ link has expired" }, { status: 410 });
        }

        return NextResponse.json({ mapping });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST submit vendor quote
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        const body = await req.json();

        const mapping = await prisma.rfqVendorMapping.findUnique({
            where: { secureToken: token },
            include: { rfq: true },
        });

        if (!mapping) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
        if (mapping.quoteSubmitted) return NextResponse.json({ error: "Quote already submitted" }, { status: 409 });
        if (mapping.tokenExpiresAt && new Date() > mapping.tokenExpiresAt) {
            return NextResponse.json({ error: "RFQ deadline has passed" }, { status: 410 });
        }

        const { items, deliveryDays, warranty, terms } = body;

        // Create quote items
        await prisma.$transaction([
            ...items.map((item: any) =>
                prisma.vendorQuoteItem.create({
                    data: {
                        rfqId: mapping.rfqId,
                        vendorId: mapping.vendorId,
                        mappingId: mapping.id,
                        itemId: item.itemId,
                        technicalDetails: item.technicalDetails || "",
                        rate: parseFloat(item.rate) || 0,
                        taxPercent: parseFloat(item.taxPercent) || 0,
                        otherCharges: parseFloat(item.otherCharges) || 0,
                        totalAmount:
                            (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0) +
                            ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0) * (parseFloat(item.taxPercent) || 0)) / 100 +
                            (parseFloat(item.otherCharges) || 0),
                        deliveryDays: parseInt(deliveryDays) || null,
                        warranty: warranty || null,
                        terms: terms || null,
                    },
                })
            ),
            prisma.rfqVendorMapping.update({
                where: { id: mapping.id },
                data: { quoteSubmitted: true, submittedAt: new Date() },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Submit quote error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
