import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const customerId = (session.user as any).customerId;

        const [
            totalMrfs,
            pendingMrfs,
            approvedMrfs,
            closedMrfs,
            totalVendors,
            totalSubsidiaries,
            totalStockItems,
            lowStockItems,
            recentMrfs,
        ] = await Promise.all([
            prisma.mrfMaster.count({ where: { customerId } }),
            prisma.mrfMaster.count({ where: { customerId, status: { in: ["SUBMITTED", "APPROVED"] } } }),
            prisma.mrfMaster.count({ where: { customerId, status: "APPROVED" } }),
            prisma.mrfMaster.count({ where: { customerId, status: "CLOSED" } }),
            prisma.mstVendor.count({ where: { customerId, isActive: true } }),
            prisma.mstSubsidiary.count({ where: { customerId, isActive: true } }),
            prisma.stkItemMaster.count({ where: { customerId, isActive: true } }),
            prisma.stkItemMaster.count({
                where: { customerId, isActive: true, currentQty: { lte: prisma.stkItemMaster.fields.minLevel } },
            }).catch(() => 0),
            prisma.mrfMaster.findMany({
                where: { customerId },
                include: { subsidiary: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);

        return NextResponse.json({
            stats: {
                totalMrfs,
                pendingMrfs,
                approvedMrfs,
                closedMrfs,
                totalVendors,
                totalSubsidiaries,
                totalStockItems,
                lowStockItems: 0,
            },
            recentMrfs,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
