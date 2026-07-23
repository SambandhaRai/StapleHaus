import { cookies } from "next/headers";
import { timingSafeEqual, verifyCsrfToken } from "./csrf-token";

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
