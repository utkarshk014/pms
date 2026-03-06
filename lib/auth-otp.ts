import { prisma } from "@/lib/prisma";
import { generateOtpCode, otpProvider } from "@/lib/otp";

/**
 * Generate and store OTP for a subsidiary login.
 * In dev mode, always sends 123456 but logs actual generated code.
 */
export async function createSubsidiaryOtp(
    subsidiaryId: string,
    mobile: string
): Promise<string> {
    // Invalidate previous OTPs for this mobile
    await prisma.otpStore.updateMany({
        where: { mobile, subsidiaryId, usedAt: null },
        data: { usedAt: new Date() },
    });

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpStore.create({
        data: {
            mobile,
            code,
            subsidiaryId,
            purpose: "LOGIN",
            expiresAt,
        },
    });

    // Fetch the email to send the OTP via SMTP
    const subsidiary = await prisma.mstSubsidiary.findUnique({
        where: { id: subsidiaryId },
        select: { email: true }
    });

    await otpProvider.sendOtp(mobile, code, subsidiary?.email || undefined);
    return code;
}

/**
 * Verify OTP for subsidiary login.
 * In dev mode, accepts "123456" as universal bypass.
 */
export async function verifySubsidiaryOtp(
    subsidiaryId: string,
    mobile: string,
    inputCode: string
): Promise<boolean> {
    // Dev mode bypass
    if (process.env.NODE_ENV === "development" && inputCode === "123456") {
        return true;
    }

    const otp = await prisma.otpStore.findFirst({
        where: {
            subsidiaryId,
            mobile,
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.code !== inputCode) return false;

    await prisma.otpStore.update({
        where: { id: otp.id },
        data: { usedAt: new Date() },
    });

    return true;
}

/**
 * Create OTP for MRF submission (verify action)
 */
export async function createMrfOtp(mobile: string): Promise<string> {
    await prisma.otpStore.updateMany({
        where: { mobile, purpose: "MRF_SUBMIT", usedAt: null },
        data: { usedAt: new Date() },
    });

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpStore.create({
        data: { mobile, code, purpose: "MRF_SUBMIT", expiresAt },
    });

    // Fetch the email to send the OTP via SMTP
    const subsidiary = await prisma.mstSubsidiary.findFirst({
        where: { mobile, isActive: true },
        select: { email: true }
    });

    await otpProvider.sendOtp(mobile, code, subsidiary?.email || undefined);
    return code;
}

/**
 * Verify OTP for MRF submission
 */
export async function verifyMrfOtp(
    mobile: string,
    inputCode: string
): Promise<boolean> {
    if (process.env.NODE_ENV === "development" && inputCode === "123456") {
        return true;
    }

    const otp = await prisma.otpStore.findFirst({
        where: { mobile, purpose: "MRF_SUBMIT", usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.code !== inputCode) return false;

    await prisma.otpStore.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
    return true;
}
