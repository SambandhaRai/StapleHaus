import { NextRequest, NextResponse } from "next/server";

const guestOnlyRoutes = ['/login', '/register'];
const protectedRoutes = ['/account', '/cart', '/checkout', '/orders', '/wishlist'];
const adminRoutes = ['/admin'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get("auth_token")?.value || null;

    const isGuestOnly = guestOnlyRoutes.some(route => pathname.startsWith(route));
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (!token) {
        if (isProtected || isAdminRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    if (isGuestOnly) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/register",
        "/account/:path*",
        "/cart/:path*",
        "/checkout/:path*",
        "/orders/:path*",
        "/wishlist/:path*",
        "/admin/:path*"
    ]
}
