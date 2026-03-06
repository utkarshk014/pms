import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars"
);

async function getSubsidiary(req: NextRequest) {
    const token = req.cookies.get("subsidiary_session")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
        return payload as { sub: string; name: string; code: string; customerId: string };
    } catch {
        return null;
    }
}

// PUT: Update a DRAFT MRF (replace all items)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { remarks, items } = body;

        // Verify MRF belongs to this subsidiary and is still DRAFT
        const existing = await prisma.mrfMaster.findFirst({
            where: { id, subsidiaryId: sub.sub },
        });
        if (!existing) return NextResponse.json({ error: "MRF not found" }, { status: 404 });
        if (existing.status !== "DRAFT")
            return NextResponse.json({ error: "Only DRAFT MRFs can be edited" }, { status: 400 });

        const filteredItems = (items || []).filter((item: any) => item.itemId);
        if (!filteredItems.length)
            return NextResponse.json({ error: "At least one valid item is required" }, { status: 400 });

        // Delete existing items and re-create
        await prisma.mrfItem.deleteMany({ where: { mrfId: id } });

        const totalAmount = filteredItems.reduce((sum: number, item: any) =>
            sum + (parseFloat(item.qty) || 1) * (parseFloat(item.expectedRate) || 0), 0);

        const mrf = await prisma.mrfMaster.update({
            where: { id },
            data: {
                remarks: remarks || null,
                totalAmount,
                mrfItems: {
                    create: filteredItems.map((item: any) => ({
                        itemId: item.itemId,
                        qty: parseFloat(item.qty) || 1,
                        expectedRate: parseFloat(item.expectedRate) || 0,
                        totalAmount: (parseFloat(item.qty) || 1) * (parseFloat(item.expectedRate) || 0),
                        description: item.remarks || null,
                    })),
                },
            },
            include: {
                mrfItems: { include: { item: true } },
            },
        });

        return NextResponse.json({ mrf });
    } catch (error) {
        console.error("Update MRF error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE: Delete a DRAFT MRF
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const existing = await prisma.mrfMaster.findFirst({
            where: { id, subsidiaryId: sub.sub },
        });
        if (!existing) return NextResponse.json({ error: "MRF not found" }, { status: 404 });
        if (existing.status !== "DRAFT")
            return NextResponse.json({ error: "Only DRAFT MRFs can be deleted" }, { status: 400 });

        // MrfItems are cascade deleted via schema (onDelete: Cascade)
        await prisma.mrfMaster.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete MRF error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
