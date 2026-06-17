import { NextRequest, NextResponse } from "next/server";

const guestOnlyRoutes = ['/login', '/register'];
const protectedRoutes = ['/account', '/cart', '/checkout', '/orders', '/wishlist'];
const adminRoutes = ['/admin'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get("auth_token")?.value || null;
    const userData = request.cookies.get("user_data")?.value;

    let user: { role?: string } | null = null;
    if (token && userData) {
        try {
            user = JSON.parse(userData);
        } catch {
            user = null;
        }
    }

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
        const destination = user?.role === "admin" ? "/admin" : "/";
        return NextResponse.redirect(new URL(destination, request.url));
    }

    if (isAdminRoute && user?.role !== "admin") {
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
