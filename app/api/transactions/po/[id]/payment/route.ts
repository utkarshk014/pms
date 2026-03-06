import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { amountPaid, paymentMode, referenceNo, paymentDate } = body;

        if (!amountPaid || amountPaid <= 0)
            return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });

        const po = await prisma.poMaster.findUnique({
            where: { id },
            include: { payments: true },
        });
        if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });

        // Create payment record
        const payment = await prisma.paymentDetails.create({
            data: {
                poId: id,
                amountPaid: parseFloat(amountPaid),
                paymentMode: paymentMode || null,
                referenceNo: referenceNo || null,
                paymentDate: new Date(paymentDate),
                status: "PAID",
            },
        });

        // Check if fully paid — if so, mark PO as COMPLETED
        const totalPaid = po.payments.reduce((s, p) => s + p.amountPaid, 0) + parseFloat(amountPaid);
        if (totalPaid >= po.totalAmount) {
            await prisma.poMaster.update({ where: { id }, data: { status: "COMPLETED" } });
        }

        return NextResponse.json({ payment });
    } catch (error) {
        console.error("Record payment error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
