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

        const po = await prisma.poMaster.findUnique({
            where: { id },
            include: {
                vendor: { select: { id: true, name: true, email: true } },
                mrf: {
                    include: {
                        subsidiary: { select: { name: true } },
                        mrfItems: {
                            include: { item: { select: { name: true, uom: true } } },
                        },
                    },
                },
                goodsInward: { orderBy: { receivedDate: "desc" } },
                payments: { orderBy: { paymentDate: "desc" } },
            },
        });

        if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });

        return NextResponse.json({ po });
    } catch (error) {
        console.error("Get PO error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
