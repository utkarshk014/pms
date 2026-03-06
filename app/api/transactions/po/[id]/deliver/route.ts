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

        const po = await prisma.poMaster.findUnique({ where: { id } });
        if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });
        if (po.status !== "ISSUED") return NextResponse.json({ error: "PO is not in ISSUED status" }, { status: 400 });

        const updated = await prisma.poMaster.update({
            where: { id },
            data: { status: "DELIVERED" },
        });

        return NextResponse.json({ po: updated });
    } catch (error) {
        console.error("Deliver PO error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
