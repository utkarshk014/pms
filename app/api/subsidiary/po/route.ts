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

// GET — list all POs for this subsidiary (via their MRFs)
export async function GET(req: NextRequest) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const pos = await prisma.poMaster.findMany({
            where: {
                mrf: { subsidiaryId: sub.sub },
            },
            include: {
                vendor: { select: { name: true, email: true } },
                mrf: {
                    select: {
                        id: true,
                        mrfNumber: true,
                        status: true,
                        mrfItems: {
                            include: { item: { select: { id: true, name: true, uom: true } } },
                        },
                    },
                },
                goodsInward: { orderBy: { receivedDate: "desc" }, take: 1 },
                payments: { orderBy: { paymentDate: "desc" } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ pos });
    } catch (error) {
        console.error("Subsidiary PO list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
