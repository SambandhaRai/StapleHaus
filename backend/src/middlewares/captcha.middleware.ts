import { Request, Response, NextFunction } from "express";
import { TURNSTILE_SECRET } from "../config";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction) => {
    if (!TURNSTILE_SECRET) {
        return next();
    }

    const token = req.body?.captchaToken;
    if (!token || typeof token !== "string") {
        return res.status(400).json({ success: false, message: "Captcha verification required" });
    }

    try {
        const params = new URLSearchParams();
        params.append("secret", TURNSTILE_SECRET);
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
