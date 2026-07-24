import { Request } from "express";
import crypto from "crypto";
import { RequestContext } from "../types/activity-log.type";
import { INTERNAL_PROXY_SECRET } from "../config";

const isTrustedCaller = (req: Request): boolean => {
    const provided = req.get("x-internal-proxy-secret");
    if (!provided) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(INTERNAL_PROXY_SECRET);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const getClientIp = (req: Request): string | undefined => {
    const socketAddress = req.socket?.remoteAddress ?? undefined;
    const forwardedIp = req.get("x-client-ip");
    if (forwardedIp && isTrustedCaller(req)) {
        return forwardedIp.split(",")[0].trim();
    }
    return socketAddress;
};

export const getRequestContext = (req: Request): RequestContext => {
    const forwardedUserAgent = req.get("x-client-user-agent");
    const userAgent = (forwardedUserAgent && isTrustedCaller(req) ? forwardedUserAgent : req.get("user-agent")) ?? undefined;
    return { ip: getClientIp(req), userAgent, sessionId: req.user?.sessionId };
};
