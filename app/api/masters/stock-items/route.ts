import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars"
);

/** Returns customerId from either a CPT session or a subsidiary session cookie */
async function getCustomerId(req: NextRequest): Promise<string | null> {
    // 1. Try CPT (NextAuth) session
    const cptSession = await auth();
    if (cptSession?.user) return (cptSession.user as any).customerId ?? null;

    // 2. Try subsidiary session cookie
    const token = req.cookies.get("subsidiary_session")?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
            return (payload as any).customerId ?? null;
        } catch { /* invalid */ }
    }

    return null;
}

export async function GET(req: NextRequest) {
    try {
        const customerId = await getCustomerId(req);
        if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const items = await prisma.stkItemMaster.findMany({
            where: { customerId, isActive: true },
            include: {
                category: { select: { name: true } },
                group: { select: { name: true } },
                manufacturer: { select: { name: true } },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ items });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // POST only for CPT staff
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;
        const body = await req.json();

        const { code, name, categoryId, groupId, manufacturerId, uom, openingQty, minLevel, reorderLevel } = body;
        if (!code || !name) return NextResponse.json({ error: "Code and name are required" }, { status: 400 });

        const existing = await prisma.stkItemMaster.findFirst({ where: { code } });
        if (existing) return NextResponse.json({ error: "Item code already exists" }, { status: 409 });

        const item = await prisma.stkItemMaster.create({
            data: {
                customerId,
                code,
                name,
                categoryId: categoryId || null,
                groupId: groupId || null,
                manufacturerId: manufacturerId || null,
                uom: uom || "Nos",
                openingQty: parseFloat(openingQty) || 0,
                currentQty: parseFloat(openingQty) || 0,
                minLevel: parseFloat(minLevel) || 0,
                reorderLevel: parseFloat(reorderLevel) || 0,
            },
        });

        return NextResponse.json({ item }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
