import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PUT update subsidiary
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { code, name, mobile, address, city, state, email, isActive } = body;

        const customerId = (session.user as any).customerId;
        const subsidiary = await prisma.mstSubsidiary.update({
            where: { id, customerId },
            data: {
                code: String(code).trim().toUpperCase(),
                name: String(name).trim(),
                mobile: String(mobile).trim(),
                address: address ? String(address).trim() : null,
                city: city ? String(city).trim() : null,
                state: state ? String(state).trim() : null,
                email: email ? String(email).trim() : null,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined
            }
        });

        return NextResponse.json({ subsidiary });
    } catch (error) {
        console.error("Update subsidiary error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE (soft delete) subsidiary
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        await prisma.mstSubsidiary.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete subsidiary error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
