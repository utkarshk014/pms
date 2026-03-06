// Email Service Abstraction
// Supports DevEmailService (console log) and SmtpEmailService for production/real testing

import nodemailer from "nodemailer";
export interface EmailService {
    sendRFQEmail(params: RFQEmailParams): Promise<void>;
    sendPOEmail(params: POEmailParams): Promise<void>;
    sendGenericEmail(params: GenericEmailParams): Promise<void>;
}

export interface RFQEmailParams {
    to: string;
    vendorName: string;
    rfqNumber: string;
    rfqLink: string;
    deadline: string;
    items: Array<{ name: string; qty: number; uom: string }>;
}

export interface POEmailParams {
    to: string;
    vendorName: string;
    poNumber: string;
    totalAmount: number;
    pdfBuffer?: Buffer;
}

export interface GenericEmailParams {
    to: string;
    subject: string;
    html: string;
}

class DevEmailService implements EmailService {
    async sendRFQEmail(params: RFQEmailParams): Promise<void> {
        console.log(
            "\n========================================",
            "\n[DEV EMAIL] RFQ Email",
            "\nTo:", params.to,
            "\nVendor:", params.vendorName,
            "\nRFQ:", params.rfqNumber,
            "\nLink:", params.rfqLink,
            "\nDeadline:", params.deadline,
            "\n========================================\n"
        );
    }

    async sendPOEmail(params: POEmailParams): Promise<void> {
        console.log(
            "\n========================================",
            "\n[DEV EMAIL] PO Email",
            "\nTo:", params.to,
            "\nVendor:", params.vendorName,
            "\nPO:", params.poNumber,
            "\nTotal:", params.totalAmount,
            "\n========================================\n"
        );
    }

    async sendGenericEmail(params: GenericEmailParams): Promise<void> {
        console.log(
            "\n========================================",
            "\n[DEV EMAIL] Generic Email",
            "\nTo:", params.to,
            "\nSubject:", params.subject,
            "\n========================================\n"
        );
    }
}

// SMTP provider for real emails
class SmtpEmailService implements EmailService {
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

    async sendRFQEmail(params: RFQEmailParams): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2563eb;">Request for Quotation</h2>
                <p>Dear ${params.vendorName},</p>
                <p>You have been invited to submit a quotation for <strong>${params.rfqNumber}</strong>.</p>
                <p><strong>Submission Deadline:</strong> ${new Date(params.deadline).toLocaleDateString()}</p>
                <br>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background: #f3f4f6; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
                    </tr>
                    ${params.items.map(i => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${i.name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${i.qty} ${i.uom}</td>
                    </tr>
                    `).join('')}
                </table>
                <div style="margin: 30px 0;">
                    <a href="${params.rfqLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Access Vendor Portal to Submit Quote
                    </a>
                </div>
                <p style="font-size: 12px; color: #666;">This is a secure link. Do not share it with anyone.</p>
            </div>
        `;

        await this.transporter.sendMail({
            from: this.from,
            to: params.to,
            subject: `Action Required: Request for Quotation ${params.rfqNumber}`,
            html
        });
    }

    async sendPOEmail(params: POEmailParams): Promise<void> {
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #16a34a;">Purchase Order Issued</h2>
                <p>Dear ${params.vendorName},</p>
                <p>We are pleased to issue Purchase Order <strong>${params.poNumber}</strong> for a total amount of ₹${params.totalAmount.toLocaleString()}.</p>
                <p>Please commence processing this order. Check the attached PDF (if available) for complete details and terms.</p>
            </div>
        `;

        await this.transporter.sendMail({
            from: this.from,
            to: params.to,
            subject: `Purchase Order Issued: ${params.poNumber}`,
            html,
            attachments: params.pdfBuffer ? [
                { filename: `${params.poNumber}.pdf`, content: params.pdfBuffer }
            ] : []
        });
    }

    async sendGenericEmail(params: GenericEmailParams): Promise<void> {
        await this.transporter.sendMail({
            from: this.from,
            to: params.to,
            subject: params.subject,
            html: params.html
        });
    }
}

function getEmailService(): EmailService {
    if (process.env.EMAIL_MODE === "smtp") {
        return new SmtpEmailService();
    }
    return new DevEmailService();
}

export const emailService = getEmailService();
