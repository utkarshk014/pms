import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateRfqNumber } from "@/lib/utils";
import { emailService } from "@/lib/email";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;

        const rfqs = await prisma.rfqMaster.findMany({
            include: {
                mrf: { include: { subsidiary: { select: { name: true } } } },
                rfqVendorMappings: { include: { vendor: { select: { name: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ rfqs });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { mrfId, vendorIds, lastDateSubmission } = body;

        if (!mrfId || !vendorIds?.length) {
            return NextResponse.json({ error: "MRF and at least one vendor are required" }, { status: 400 });
        }

        // Verify MRF is in APPROVED status
        const mrf = await prisma.mrfMaster.findUnique({
            where: { id: mrfId },
            include: { mrfItems: { include: { item: true } } },
        });
        if (!mrf || mrf.status !== "APPROVED") {
            return NextResponse.json({ error: "MRF must be in APPROVED status" }, { status: 400 });
        }

        const count = await prisma.rfqMaster.count();
        const rfqNumber = generateRfqNumber(count + 1);

        const rfq = await prisma.rfqMaster.create({
            data: {
                mrfId,
                rfqNumber,
                lastDateSubmission: lastDateSubmission ? new Date(lastDateSubmission) : null,
                status: "OPEN",
                rfqVendorMappings: {
                    create: vendorIds.map((vendorId: string) => ({
                        vendorId,
                        tokenExpiresAt: lastDateSubmission ? new Date(lastDateSubmission) : null,
                    })),
                },
            },
            include: {
                rfqVendorMappings: { include: { vendor: true } },
            },
        });

        // Update MRF status
        await prisma.mrfMaster.update({ where: { id: mrfId }, data: { status: "RFQ_SENT" } });

        // Send emails to vendors (dev: logs to console)
        const deadline = lastDateSubmission ? new Date(lastDateSubmission).toLocaleDateString("en-IN") : "TBD";
        for (const mapping of rfq.rfqVendorMappings) {
            const rfqLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vendor/rfq/${mapping.secureToken}`;
            if (mapping.vendor.email) {
                await emailService.sendRFQEmail({
                    to: mapping.vendor.email,
                    vendorName: mapping.vendor.name,
                    rfqNumber: rfq.rfqNumber,
                    rfqLink,
                    deadline,
                    items: mrf.mrfItems.map(i => ({ name: i.item.name, qty: i.qty, uom: i.item.uom })),
                });
            }
        }

        return NextResponse.json({ rfq }, { status: 201 });
    } catch (error) {
        console.error("Create RFQ error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
