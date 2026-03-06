import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;

        const vendors = await prisma.mstVendor.findMany({
            where: { customerId, isActive: true },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ vendors });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;
        const body = await req.json();
        const { name, address, gstNo, panNo, contactPerson, mobile, email, vendorType } = body;

        if (!name) return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });

        const vendor = await prisma.mstVendor.create({
            data: { customerId, name, address, gstNo, panNo, contactPerson, mobile, email, vendorType },
        });

        return NextResponse.json({ vendor }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
