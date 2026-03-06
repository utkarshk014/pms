import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Generic helper for simple master tables (category, group, manufacturer)
async function getAll(model: any, customerId: string) {
    return model.findMany({ where: { customerId, isActive: true }, orderBy: { name: "asc" } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;
        const { entity } = await params;

        let data: any[] = [];
        switch (entity) {
            case "stock-categories":
                data = await getAll(prisma.stkCategory, customerId);
                break;
            case "stock-groups":
                data = await getAll(prisma.stkGroup, customerId);
                break;
            case "manufacturers":
                data = await getAll(prisma.stkManufacturer, customerId);
                break;
            default:
                return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;
        const { entity } = await params;
        const { name } = await req.json();

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        let record: any;
        switch (entity) {
            case "stock-categories":
                record = await prisma.stkCategory.create({ data: { customerId, name } });
                break;
            case "stock-groups":
                record = await prisma.stkGroup.create({ data: { customerId, name } });
                break;
            case "manufacturers":
                record = await prisma.stkManufacturer.create({ data: { customerId, name } });
                break;
            default:
                return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
        }

        return NextResponse.json({ record }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
