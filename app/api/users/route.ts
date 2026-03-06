import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if ((session.user as any).role !== "ADMIN")
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const users = await prisma.swUserDetails.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
                isActive: true,
                isBlocked: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
