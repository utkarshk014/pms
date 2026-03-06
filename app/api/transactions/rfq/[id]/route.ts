import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const rfq = await prisma.rfqMaster.findUnique({
            where: { id },
            include: {
                mrf: {
                    include: {
                        subsidiary: { select: { name: true } },
                        mrfItems: {
                            include: { item: { select: { name: true, uom: true, code: true } } },
                        },
                    },
                },
                rfqVendorMappings: {
                    include: {
                        vendor: { select: { id: true, name: true, email: true } },
                        quotes: {
                            include: {
                                item: { select: { id: true, name: true, uom: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!rfq) return NextResponse.json({ error: "RFQ not found" }, { status: 404 });

        // Check if a PO already exists for this MRF
        const existingPo = await prisma.poMaster.findFirst({
            where: { mrfId: rfq.mrfId },
            select: { id: true, poNumber: true, vendor: { select: { name: true } } },
        });

        return NextResponse.json({ rfq, existingPo: existingPo || null });
    } catch (error) {
        console.error("Get RFQ error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
