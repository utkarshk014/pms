import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { jwtVerify } from "jose";
import { verifyMrfOtp, createMrfOtp } from "@/lib/auth-otp";

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars"
);

async function getAnySession(req: NextRequest) {
    // Try CPT session first (NextAuth)
    const cptSession = await auth();
    if (cptSession?.user) return { type: "CPT", session: cptSession.user };

    // Try subsidiary session
    const token = req.cookies.get("subsidiary_session")?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
            return { type: "SUBSIDIARY", session: payload };
        } catch {
            /* invalid token */
        }
    }

    return null;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; action: string }> }
) {
    try {
        const auth = await getAnySession(req);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, action } = await params;

        const bodyText = await req.text();
        const body = bodyText ? JSON.parse(bodyText) : {};

        const mrf = await prisma.mrfMaster.findUnique({
            where: { id },
            include: { subsidiary: true },
        });
        if (!mrf) return NextResponse.json({ error: "MRF not found" }, { status: 404 });

        switch (action) {
            case "send-otp": {
                if (mrf.status !== "DRAFT") {
                    return NextResponse.json({ error: "Only DRAFT MRFs can be submitted" }, { status: 400 });
                }
                const mobile = mrf.subsidiary?.mobile;
                if (!mobile) return NextResponse.json({ error: "Subsidiary mobile not found" }, { status: 400 });

                await createMrfOtp(mobile);
                return NextResponse.json({ success: true, message: "OTP sent successfully" });
            }

            case "submit": {
                if (mrf.status !== "DRAFT") {
                    return NextResponse.json({ error: "Only DRAFT MRFs can be submitted" }, { status: 400 });
                }

                const { otp, otpCode, mobile } = body;
                const providedOtp = otp || otpCode;
                if (!providedOtp) return NextResponse.json({ error: "OTP is required to submit" }, { status: 400 });

                const mobileToUse = mobile || mrf.subsidiary?.mobile;
                const validOtp = await verifyMrfOtp(mobileToUse, providedOtp);
                if (!validOtp) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });

                await prisma.mrfMaster.update({
                    where: { id },
                    data: { status: "SUBMITTED", submittedAt: new Date() },
                });
                return NextResponse.json({ success: true, status: "SUBMITTED" });
            }

            case "approve": {
                // Only CPT can approve
                if (auth.type !== "CPT") {
                    return NextResponse.json({ error: "Only CPT staff can approve MRFs" }, { status: 403 });
                }
                if (!["SUBMITTED"].includes(mrf.status)) {
                    return NextResponse.json({ error: "Only SUBMITTED MRFs can be approved" }, { status: 400 });
                }
                await prisma.mrfMaster.update({
                    where: { id },
                    data: { status: "APPROVED", approvedAt: new Date() },
                });
                return NextResponse.json({ success: true, status: "APPROVED" });
            }

            case "reject": {
                if (auth.type !== "CPT") {
                    return NextResponse.json({ error: "Only CPT staff can reject MRFs" }, { status: 403 });
                }
                const { reason } = body;
                if (!reason) return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
                await prisma.mrfMaster.update({
                    where: { id },
                    data: { status: "REJECTED", rejectedReason: reason },
                });
                return NextResponse.json({ success: true, status: "REJECTED" });
            }

            default:
                return NextResponse.json({ error: "Unknown action" }, { status: 400 });
        }
    } catch (error) {
        console.error("MRF action error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
