// Prisma v7: PrismaClient is generated into .prisma/client and re-exported from @prisma/client
// The adapter-based constructor requires 'as any' casts for the options until Prisma v7 types stabilize
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL!;
    const adapter = new PrismaPg({ connectionString });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ??
    createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
