import type { NextAuthConfig } from "next-auth";

// This config is safe for Edge runtime (no Prisma, no bcrypt)
// Used in middleware.ts to protect routes globally
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith("/dashboard") ||
                nextUrl.pathname.startsWith("/masters") ||
                nextUrl.pathname.startsWith("/transactions") ||
                nextUrl.pathname.startsWith("/reports") ||
                nextUrl.pathname.startsWith("/users");

            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to /login
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.customerId = (user as any).customerId;
                token.userType = (user as any).userType;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).customerId = token.customerId;
                (session.user as any).userType = token.userType;
            }
            return session;
        },
    },
    session: { strategy: "jwt" },
    providers: [], // Providers are added in auth.ts (Node runtime only)
};
