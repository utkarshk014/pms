import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySubsidiaryOtp } from "@/lib/auth-otp";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars"
);

export async function POST(req: NextRequest) {
    try {
        const { subsidiaryId, mobile, code } = await req.json();

        if (!subsidiaryId || !mobile || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify OTP
        const isValid = await verifySubsidiaryOtp(subsidiaryId, mobile, code);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
        }

        // Get subsidiary details
        const subsidiary = await prisma.mstSubsidiary.findUnique({
            where: { id: subsidiaryId },
        });

        if (!subsidiary) {
            return NextResponse.json({ error: "Subsidiary not found" }, { status: 404 });
        }

        // Create JWT token
        const token = await new SignJWT({
            sub: subsidiaryId,
            name: subsidiary.name,
            code: subsidiary.code,
            customerId: subsidiary.customerId,
            userType: "SUBSIDIARY",
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("8h")
            .sign(JWT_SECRET);

        const response = NextResponse.json({
            success: true,
            redirectTo: "/subsidiary/mrf"
        });

        // Set httpOnly cookie
        response.cookies.set("subsidiary_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
