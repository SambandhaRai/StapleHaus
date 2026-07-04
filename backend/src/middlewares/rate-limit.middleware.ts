import rateLimit, { Options, ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";
import { getClientIp } from "../utils/request-context";

const tooManyHandler = (_req: Request, res: Response) => {
    return res.status(429).json({
        success: false,
        message: "Too many attempts, please try again in a few minutes",
    });
};

const byClientIp = (req: Request) => {
    const ip = getClientIp(req);
    return ip ? ipKeyGenerator(ip) : "unknown";
};

const byEmail = (req: Request) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (email) return email;
    return byClientIp(req);
};

const byUser = (req: Request) => {
    return req.user?.id ?? byClientIp(req);
};

const baseOptions: Partial<Options> = {
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooManyHandler,
    skip: (req: Request) => req.ipAllowlisted === true,
};

export const globalLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 600,
    keyGenerator: byClientIp,
});

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

export const twoFactorLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
});

export const forgotPasswordLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 3,
    keyGenerator: byEmail,
});

export const resetPasswordLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 6,
    keyGenerator: byClientIp,
    skipSuccessfulRequests: true,
});

export const twoFactorManageLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: byUser,
    skipSuccessfulRequests: true,
});

export const passwordChangeLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: byUser,
    skipSuccessfulRequests: true,
});

export const checkoutLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    keyGenerator: byUser,
});

export const reviewWriteLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 8,
    keyGenerator: byUser,
});
