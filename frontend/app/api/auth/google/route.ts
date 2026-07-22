import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startGoogleLogin } from "@/lib/actions/auth-action";

export async function GET(request: NextRequest) {
    try {
        const url = await startGoogleLogin();
        return NextResponse.redirect(url);
    } catch (err: Error | any) {
        const message = err.message || "Could not start Google sign-in";
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
    }
}
