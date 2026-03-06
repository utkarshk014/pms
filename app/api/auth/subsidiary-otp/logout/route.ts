import { NextRequest, NextResponse } from "next/server";

// Clears the subsidiary session cookie and redirects to login
export async function GET(req: NextRequest) {
    const response = NextResponse.redirect(new URL("/subsidiary-login", req.url));
    response.cookies.set("subsidiary_session", "", { maxAge: 0, path: "/" });
    return response;
}
