// OTP Abstraction Layer
// Supports DevOtpProvider (console log) and SmtpOtpProvider for production/real testing

import nodemailer from "nodemailer";

export interface OtpProvider {
    sendOtp(mobile: string, code: string, email?: string): Promise<void>;
}

class DevOtpProvider implements OtpProvider {
    async sendOtp(mobile: string, code: string, email?: string): Promise<void> {
        console.log(
            "\n========================================",
            "\n[DEV OTP] Mobile:", mobile,
            email ? `\n[DEV OTP] Email: ${email}` : "",
            "\n[DEV OTP] Code:", code,
            "\n[DEV OTP] (use 123456 in dev mode)",
            "\n========================================\n"
        );
    }
}

// SMTP provider for real emails
class SmtpOtpProvider implements OtpProvider {
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    private from = process.env.SMTP_FROM_EMAIL || '"Procurement System" <noreply@yourdomain.com>';

    async sendOtp(mobile: string, code: string, email?: string): Promise<void> {
        if (!email) {
            console.warn(`[SMTP OTP] Warning: No email provided for mobile ${mobile}. Falling back to console log for OTP: ${code}`);
            return;
        }

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-top: 0;">Authentication Required</h2>
                <p>You requested a one-time password to access the Procurement System.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${code}</span>
                </div>
                <p>This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: this.from,
                to: email,
                subject: `Your Procurement System OTP is ${code}`,
                html
            });
            console.log(`[SMTP OTP] Sent to ${email}`);
        } catch (error) {
            console.error(`[SMTP OTP] Failed to send email to ${email}:`, error);
        }
    }
}

function getOtpProvider(): OtpProvider {
    if (process.env.OTP_MODE === "smtp") {
        return new SmtpOtpProvider();
    }
    return new DevOtpProvider();
}

export const otpProvider = getOtpProvider();

// Generate a random 6-digit OTP
export function generateOtpCode(): string {
    if (process.env.NODE_ENV === "development") {
        // In dev use fixed code or random
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate OTP in dev mode (accepts 123456 always)
export function isDevMode(): boolean {
    return process.env.NODE_ENV === "development" || process.env.OTP_MODE === "dev";
}
