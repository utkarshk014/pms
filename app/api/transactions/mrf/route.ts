import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateMrfNumber } from "@/lib/utils";

// GET - list MRFs (filtered by role/status)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const customerId = (session.user as any).customerId;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where: any = { customerId };
        if (status) where.status = status;

        const mrfs = await prisma.mrfMaster.findMany({
            where,
            include: {
                subsidiary: { select: { name: true, code: true } },
                mrfItems: {
                    include: {
                        item: { select: { name: true, uom: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ mrfs });
    } catch (error) {
        console.error("Get MRFs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - create MRF draft (called from subsidiary portal also)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const customerId = (session.user as any).customerId;
        const body = await req.json();
        const { subsidiaryId, remarks, requiredByDate, preferredVendor, items } = body;

        if (!subsidiaryId) return NextResponse.json({ error: "Subsidiary is required" }, { status: 400 });
        if (!items || items.length === 0) return NextResponse.json({ error: "At least one item is required" }, { status: 400 });

        // Generate MRF number
        const count = await prisma.mrfMaster.count({ where: { customerId } });
        const mrfNumber = generateMrfNumber(count + 1);

        // Calculate total
        const totalAmount = items.reduce((sum: number, item: any) => {
            const base = (item.qty || 0) * (item.expectedRate || 0);
            const tax = (base * (item.taxPercent || 0)) / 100;
            return sum + base + tax + (item.otherCharges || 0);
        }, 0);

        const mrf = await prisma.mrfMaster.create({
            data: {
                customerId,
                subsidiaryId,
                mrfNumber,
                status: "DRAFT",
                remarks,
                requiredByDate: requiredByDate ? new Date(requiredByDate) : null,
                preferredVendor,
                totalAmount,
                mrfItems: {
                    create: items.map((item: any) => ({
                        itemId: item.itemId,
                        description: item.description || "",
                        qty: parseFloat(item.qty) || 0,
                        expectedRate: parseFloat(item.expectedRate) || 0,
                        taxPercent: parseFloat(item.taxPercent) || 0,
                        otherCharges: parseFloat(item.otherCharges) || 0,
                        totalAmount:
                            (parseFloat(item.qty) || 0) * (parseFloat(item.expectedRate) || 0) +
                            ((parseFloat(item.qty) || 0) * (parseFloat(item.expectedRate) || 0) * (parseFloat(item.taxPercent) || 0)) / 100 +
                            (parseFloat(item.otherCharges) || 0),
                    })),
                },
            },
            include: { mrfItems: true },
        });

        return NextResponse.json({ mrf }, { status: 201 });
    } catch (error) {
        console.error("Create MRF error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
