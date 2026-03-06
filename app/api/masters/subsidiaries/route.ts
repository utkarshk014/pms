import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all subsidiaries
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const customerId = (session.user as any).customerId;

        const subsidiaries = await prisma.mstSubsidiary.findMany({
            where: { customerId },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ subsidiaries });
    } catch (error) {
        console.error("Get subsidiaries error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST create subsidiary
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const customerId = (session.user as any).customerId;
        const body = await req.json();

        const { code, name, address, city, state, mobile, email } = body;
        if (!code || !name || !mobile) {
            return NextResponse.json({ error: "Code, name, and mobile are required" }, { status: 400 });
        }

        // Check duplicate code
        const existing = await prisma.mstSubsidiary.findFirst({ where: { code: code.toUpperCase() } });
        if (existing) {
            return NextResponse.json({ error: "Institution code already exists" }, { status: 409 });
        }

        const subsidiary = await prisma.mstSubsidiary.create({
            data: { customerId, code: code.toUpperCase(), name, address, city, state, mobile, email },
        });

        return NextResponse.json({ subsidiary }, { status: 201 });
    } catch (error) {
        console.error("Create subsidiary error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
