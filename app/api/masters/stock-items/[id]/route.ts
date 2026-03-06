import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;
        const body = await req.json();
        const { name, categoryId, groupId, manufacturerId, uom, minLevel, reorderLevel } = body;
        const item = await prisma.stkItemMaster.update({
            where: { id },
            data: { name, categoryId: categoryId || null, groupId: groupId || null, manufacturerId: manufacturerId || null, uom, minLevel: parseFloat(minLevel) || 0, reorderLevel: parseFloat(reorderLevel) || 0 },
        });
        return NextResponse.json({ item });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await params;
        await prisma.stkItemMaster.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
