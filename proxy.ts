import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

// Routes that require CPT login (NextAuth)
const CPT_ROUTES = ["/dashboard", "/masters", "/transactions", "/reports", "/users"];
// Routes that require subsidiary login (custom JWT)
const SUBSIDIARY_ROUTES = ["/subsidiary"];
// Public routes - no auth needed
const PUBLIC_ROUTES = ["/login", "/subsidiary-login", "/vendor", "/api/auth", "/api/vendor", "/api/subsidiary"];

const SUBSIDIARY_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars"
);

async function getSubsidiarySession(req: NextRequest): Promise<any | null> {
    const token = req.cookies.get("subsidiary_session")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SUBSIDIARY_SECRET, { algorithms: ["HS256"] });
        return payload;
    } catch {
        return null;
    }
}

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow Next.js internals and static files
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/vendor")
    ) {
        return NextResponse.next();
    }

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // CPT routes - require NextAuth session (uses next-auth getToken to handle JWE decryption)
    if (CPT_ROUTES.some((route) => pathname.startsWith(route))) {
        // NextAuth v5 beta uses different cookie names depending on protocol:
        // - HTTP (local dev): "authjs.session-token"
        // - HTTPS (Vercel prod): "__Secure-authjs.session-token"
        const isSecure = req.url.startsWith("https://");
        const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
        const token = await getToken({
            req,
            secret: process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars",
            cookieName,
        });
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.next();
    }

    // Subsidiary routes - require subsidiary JWT cookie
    if (SUBSIDIARY_ROUTES.some((route) => pathname.startsWith(route))) {
        const session = await getSubsidiarySession(req);
        if (!session) {
            return NextResponse.redirect(new URL("/subsidiary-login", req.url));
        }
        return NextResponse.next();
    }

    // Root redirect
    if (pathname === "/") {
        const isSecure = req.url.startsWith("https://");
        const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
        const token = await getToken({
            req,
            secret: process.env.AUTH_SECRET || "pms-dev-secret-key-change-in-production-minimum-32-chars",
            cookieName,
        });
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
