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

// POST — mark goods received for a PO
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { remarks } = body;

        // Verify PO belongs to this subsidiary
        const po = await prisma.poMaster.findFirst({
            where: { id, mrf: { subsidiaryId: sub.sub } },
            include: {
                mrf: {
                    include: {
                        mrfItems: { include: { item: true } },
                    },
                },
            },
        });

        if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });
        if (po.status !== "ISSUED") return NextResponse.json({ error: "Goods already marked received" }, { status: 400 });

        // Create GoodsInward record
        await prisma.goodsInward.create({
            data: {
                poId: id,
                subsidiaryId: sub.sub,
                receivedDate: new Date(),
                remarks: remarks || null,
            },
        });

        // Update stock quantities for each item in the MRF
        for (const mrfItem of po.mrf.mrfItems) {
            await prisma.stkItemMaster.update({
                where: { id: mrfItem.itemId },
                data: { currentQty: { increment: mrfItem.qty } },
            });
        }

        // Update PO status to DELIVERED
        await prisma.poMaster.update({
            where: { id },
            data: { status: "DELIVERED" },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Goods inward error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
