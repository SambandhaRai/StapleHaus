import { Request, Response, NextFunction } from "express";
import { RECAPTCHA_SECRET } from "../config";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

// Anti-automation control for auth endpoints (login/register/forgot-password):
// makes it impractical to script large-scale brute-force, credential-stuffing,
// or account-enumeration attempts against these routes.
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.body?.captchaToken;
    // Strict type check: a non-string value (e.g. a bare JSON number like
    // 12345) is rejected here rather than being forwarded to Google, since
    // only a real string token could ever verify successfully anyway.
    if (!token || typeof token !== "string") {
        return res.status(400).json({ success: false, message: "Captcha verification required" });
    }

    try {
        const params = new URLSearchParams();
        params.append("secret", RECAPTCHA_SECRET);
        params.append("response", token);

        const response = await fetch(VERIFY_URL, { method: "POST", body: params });
        const data = await response.json() as { success?: boolean };

        if (!data.success) {
            return res.status(400).json({ success: false, message: "Captcha verification failed" });
        }

        return next();
    } catch {
        return res.status(502).json({ success: false, message: "Could not verify captcha, please try again" });
    }
};
