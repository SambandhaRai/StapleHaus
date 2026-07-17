import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { completeGoogleLogin } from "@/lib/actions/auth-action";
import { clearGoogleState } from "@/lib/cookie";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const fail = async (message: string) => {
        await clearGoogleState();
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
    };

    if (params.get("error")) {
        return fail("Google sign-in was cancelled");
    }

    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
        return fail("Google sign-in could not be verified, please try again");
    }

    const result = await completeGoogleLogin(code, state);

    if (!result.success) {
        return fail(result.message || "Google sign-in failed");
    }
    if (result.twoFactorRequired) {
        return NextResponse.redirect(new URL("/login/2fa", request.url));
    }
    if (result.passwordExpired) {
        return NextResponse.redirect(new URL("/login/password-expired", request.url));
    }

    return NextResponse.redirect(new URL(result.data?.role === "admin" ? "/admin" : "/", request.url));
}
