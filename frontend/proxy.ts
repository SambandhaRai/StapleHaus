import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, timingSafeEqual, verifyCsrfToken } from "./lib/csrf-token";
import { verifySessionToken } from "./lib/jwt-verify";

const guestOnlyRoutes = ['/login', '/register'];
const protectedRoutes = ['/account', '/cart', '/checkout', '/orders', '/wishlist'];
const adminRoutes = ['/admin'];
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const originMatchesHost = (request: NextRequest): boolean => {
    const host = request.headers.get("host");
    if (!host) return false;
    for (const source of ["origin", "referer"]) {
        const value = request.headers.get(source);
        if (!value) continue;
        try {
            return new URL(value).host === host;
        } catch {
            return false;
        }
    }
    return false;
};

const csrfHeaderValid = async (request: NextRequest): Promise<boolean> => {
    const header = request.headers.get("x-csrf-token");
    if (!header) return true;
    const cookieToken = request.cookies.get("csrf_token")?.value;
    if (!cookieToken || !timingSafeEqual(header, cookieToken)) return false;
    return verifyCsrfToken(header);
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (unsafeMethods.has(request.method) && (!originMatchesHost(request) || !(await csrfHeaderValid(request)))) {
        return new NextResponse(
            JSON.stringify({ success: false, message: "CSRF validation failed" }),
            { status: 403, headers: { "content-type": "application/json" } }
        );
    }

    const token = request.cookies.get("auth_token")?.value || null;
    const session = await verifySessionToken(token);

    const isGuestOnly = guestOnlyRoutes.some(route => pathname.startsWith(route));
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    let response: NextResponse;

    if (!session) {
        response = (isProtected || isAdminRoute)
            ? NextResponse.redirect(new URL("/login", request.url))
            : NextResponse.next();
    } else {
        const isAdmin = session.role === "admin";
        if (isAdminRoute && !isAdmin) {
            response = NextResponse.redirect(new URL("/", request.url));
        } else if (isAdmin && !isAdminRoute) {
            response = NextResponse.redirect(new URL("/admin", request.url));
        } else if (isGuestOnly) {
            response = NextResponse.redirect(new URL(isAdmin ? "/admin" : "/", request.url));
        } else {
            response = NextResponse.next();
        }
    }

    if (!request.cookies.get("csrf_token")) {
        response.cookies.set("csrf_token", await generateCsrfToken(), {
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
    }

    if (request.cookies.has("user_data")) {
        response.cookies.delete("user_data");
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
    ]
}
