import { cookies } from "next/headers";
import { timingSafeEqual, verifyCsrfToken } from "./csrf-token";

// Double-submit CSRF check for cookie-based session actions: a cross-site
// page can make the browser send the csrf_token COOKIE automatically, but it
// can't read that cookie's value to also put it in the request BODY, so the
// two must match, and the cookie itself must carry a valid HMAC signature
// (see csrf-token.ts) so it can't just be guessed or reused from another user.
export const assertCsrfToken = async (token?: string) => {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("csrf_token")?.value;
    if (!token || !cookieToken || !timingSafeEqual(token, cookieToken)) {
        throw new Error("CSRF validation failed");
    }
    if (!(await verifyCsrfToken(cookieToken))) {
        throw new Error("CSRF validation failed");
    }
};
