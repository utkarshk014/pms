import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
    // Match all routes except static files, images, and NextAuth API routes
    matcher: ["/((?!api/auth|api/vendor|_next/static|_next/image|favicon.ico|vendor).*)"],
};
