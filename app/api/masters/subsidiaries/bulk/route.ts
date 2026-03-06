import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Moved body parsing to the beginning

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Expected an array of data" }, { status: 400 });
        }

        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const customerId = (session.user as any).customerId;

        // Results tracking
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        // Get existing codes to check for duplicates quickly
        const existingSubsidiaries = await prisma.mstSubsidiary.findMany({
            where: { customerId },
            select: { code: true }
        });
        const existingCodes = new Set(existingSubsidiaries.map(s => s.code.toUpperCase()));

        // Process rows securely (transactions are great, but skipping invalid rows is better for UX here)
        for (const [index, row] of body.entries()) {
            const rowNum = index + 2; // +1 for 0-index, +1 for header

            // Normalize data mapping from Excel headers
            const code = String(row["Code"] || "").trim().toUpperCase();
            const name = String(row["Name"] || "").trim();
            const mobile = String(row["Mobile"] || "").trim();
            const address = row["Address"] ? String(row["Address"]).trim() : null;
            const city = row["City"] ? String(row["City"]).trim() : null;
            const state = row["State"] ? String(row["State"]).trim() : null;
            const email = row["Email"] ? String(row["Email"]).trim() : null;

            // Basic Validation
            if (!code || !name || !mobile) {
                failCount++;
                errors.push(`Row ${rowNum}: Code, Name, and Mobile are required.`);
                continue;
            }

            // Duplicate Check
            if (existingCodes.has(code)) {
                failCount++;
                errors.push(`Row ${rowNum}: Subsidiary Code '${code}' already exists.`);
                continue;
            }

            try {
                await prisma.mstSubsidiary.create({
                    data: {
                        customerId,
                        code,
                        name,
                        mobile,
                        address,
                        city,
                        state,
                        email,
                    }
                });
                successCount++;
                existingCodes.add(code); // prevent duplicates within the same sheet
            } catch (error: any) {
                failCount++;
                errors.push(`Row ${rowNum}: DB Error - ${error.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Import complete. ${successCount} added, ${failCount} failed.`,
            successCount,
            failCount,
            errors
        });

    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}
