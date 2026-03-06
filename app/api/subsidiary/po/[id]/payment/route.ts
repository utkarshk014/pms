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

// POST — record payment for a PO
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { amountPaid, paymentMode, referenceNo, paymentDate } = body;

        if (!amountPaid || parseFloat(amountPaid) <= 0)
            return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });

        // Verify PO belongs to this subsidiary
        const po = await prisma.poMaster.findFirst({
            where: { id, mrf: { subsidiaryId: sub.sub } },
            include: { payments: true },
        });

        if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });
        if (po.status === "COMPLETED") return NextResponse.json({ error: "PO is already completed" }, { status: 400 });

        // Record payment
        await prisma.paymentDetails.create({
            data: {
                poId: id,
                amountPaid: parseFloat(amountPaid),
                paymentMode: paymentMode || null,
                referenceNo: referenceNo || null,
                paymentDate: new Date(paymentDate),
                status: "PAID",
            },
        });

        // Check if fully paid
        const totalPaid = po.payments.reduce((s, p) => s + p.amountPaid, 0) + parseFloat(amountPaid);
        if (totalPaid >= po.totalAmount) {
            // Mark PO as COMPLETED
            await prisma.poMaster.update({ where: { id }, data: { status: "COMPLETED" } });

            // Mark MRF as CLOSED
            await prisma.mrfMaster.update({ where: { id: po.mrfId }, data: { status: "CLOSED" } });
        }

        return NextResponse.json({ success: true, fullyPaid: totalPaid >= po.totalAmount });
    } catch (error) {
        console.error("Record payment error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
