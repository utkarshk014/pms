import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSubsidiaryOtp } from "@/lib/auth-otp";

export async function POST(req: NextRequest) {
    try {
        const { code, mobile } = await req.json();

        if (!code || !mobile) {
            return NextResponse.json({ error: "Institution code and mobile are required" }, { status: 400 });
        }

        // Find subsidiary by code
        const subsidiary = await prisma.mstSubsidiary.findFirst({
            where: { code: code.toUpperCase(), isActive: true },
        });

        if (!subsidiary) {
            return NextResponse.json({ error: "Institution code not found" }, { status: 404 });
        }

        // Verify the mobile matches
        if (subsidiary.mobile !== mobile) {
            return NextResponse.json({ error: "Mobile number does not match institution records" }, { status: 401 });
        }

        // Generate OTP
        await createSubsidiaryOtp(subsidiary.id, mobile);

        return NextResponse.json({
            success: true,
            subsidiaryId: subsidiary.id,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
