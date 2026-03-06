import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;
        const mrf = await prisma.mrfMaster.findUnique({
            where: { id },
            include: {
                subsidiary: true,
                mrfItems: {
                    include: { item: { select: { code: true, name: true, uom: true } } },
                },
            },
        });
        if (!mrf) return NextResponse.json({ error: "MRF not found" }, { status: 404 });
        return NextResponse.json({ mrf });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;
        const body = await req.json();

        // Only allow edit if DRAFT
        const existing = await prisma.mrfMaster.findUnique({ where: { id } });
        if (!existing || existing.status !== "DRAFT") {
            return NextResponse.json({ error: "Only DRAFT MRFs can be edited" }, { status: 400 });
        }

        const { remarks, requiredByDate, preferredVendor, items } = body;

        // Recalculate total
        const totalAmount = (items || []).reduce((sum: number, item: any) => {
            const base = (item.qty || 0) * (item.expectedRate || 0);
            const tax = (base * (item.taxPercent || 0)) / 100;
            return sum + base + tax + (item.otherCharges || 0);
        }, 0);

        // Delete old items and recreate
        await prisma.mrfItem.deleteMany({ where: { mrfId: id } });

        const mrf = await prisma.mrfMaster.update({
            where: { id },
            data: {
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
        });
        return NextResponse.json({ mrf });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
