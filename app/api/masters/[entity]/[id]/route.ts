import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { entity, id } = await params;
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        let record: any;
        switch (entity) {
            case "stock-categories":
                record = await prisma.stkCategory.update({ where: { id }, data: { name } });
                break;
            case "stock-groups":
                record = await prisma.stkGroup.update({ where: { id }, data: { name } });
                break;
            case "manufacturers":
                record = await prisma.stkManufacturer.update({ where: { id }, data: { name } });
                break;
            default:
                return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
        }
        return NextResponse.json({ record });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { entity, id } = await params;

        switch (entity) {
            case "stock-categories":
                await prisma.stkCategory.update({ where: { id }, data: { isActive: false } });
                break;
            case "stock-groups":
                await prisma.stkGroup.update({ where: { id }, data: { isActive: false } });
                break;
            case "manufacturers":
                await prisma.stkManufacturer.update({ where: { id }, data: { isActive: false } });
                break;
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
