import { NextRequest, NextResponse } from "next/server";

const guestOnlyRoutes = ['/login', '/register'];
const protectedRoutes = ['/account', '/cart', '/checkout', '/orders', '/wishlist'];
const adminRoutes = ['/admin'];

const getRole = (request: NextRequest): string | null => {
    const raw = request.cookies.get("user_data")?.value;
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as { role?: string };
        return parsed.role ?? null;
    } catch {
        return null;
    }
};

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

    const isAdmin = getRole(request) === "admin";

    if (isAdmin && !isAdminRoute) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (isGuestOnly) {
        return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
    ]
}
