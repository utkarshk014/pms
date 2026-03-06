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

// GET: List all MRFs for this subsidiary
export async function GET(req: NextRequest) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const mrfs = await prisma.mrfMaster.findMany({
            where: { subsidiaryId: sub.sub },
            include: {
                mrfItems: {
                    include: { item: { select: { name: true, uom: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ mrfs });
    } catch (error) {
        console.error("GET subsidiary MRF error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST: Create draft MRF
export async function POST(req: NextRequest) {
    try {
        const sub = await getSubsidiary(req);
        if (!sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { remarks, items } = body;

        if (!items?.length) {
            return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
        }

        const filteredItems = items.filter((item: any) => item.itemId);
        if (!filteredItems.length) {
            return NextResponse.json({ error: "At least one valid item is required" }, { status: 400 });
        }

        const count = await prisma.mrfMaster.count({ where: { subsidiaryId: sub.sub } });
        const mrfNumber = `MRF-${sub.code}-${String(count + 1).padStart(4, "0")}`;

        const totalAmount = filteredItems.reduce((sum: number, item: any) =>
            sum + (parseFloat(item.qty) || 1) * (parseFloat(item.expectedRate) || 0), 0);

        const mrf = await prisma.mrfMaster.create({
            data: {
                mrfNumber,
                customerId: sub.customerId,
                subsidiaryId: sub.sub,
                remarks: remarks || null,
                status: "DRAFT",
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

        return NextResponse.json({ mrf }, { status: 201 });
    } catch (error) {
        console.error("Create MRF error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
