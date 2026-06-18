import rateLimit, { Options, ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";

const tooManyHandler = (_req: Request, res: Response) => {
    return res.status(429).json({
        success: false,
        message: "Too many attempts, please try again in a few minutes",
    });
};

const byEmail = (req: Request) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (email) return email;
    return req.ip ? ipKeyGenerator(req.ip) : "unknown";
};

const baseOptions: Partial<Options> = {
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooManyHandler,
};

export const loginLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 12,
    keyGenerator: byEmail,
    skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
    ...baseOptions,
    windowMs: 60 * 60 * 1000,
    limit: 5,
    keyGenerator: byEmail,
});

export const verifyOtpLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 6,
    keyGenerator: byEmail,
    skipSuccessfulRequests: true,
});

export const resendOtpLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 4,
    keyGenerator: byEmail,
});

export const googleLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 30,
});
