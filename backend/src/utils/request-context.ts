import { Request } from "express";
import { RequestContext } from "../types/activity-log.type";

const trustedProxyAddresses = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export const getClientIp = (req: Request): string | undefined => {
    const socketAddress = req.socket?.remoteAddress ?? undefined;
    const forwardedIp = req.get("x-client-ip");
    if (forwardedIp && socketAddress && trustedProxyAddresses.has(socketAddress)) {
        return forwardedIp.split(",")[0].trim();
    }
    return socketAddress;
};

export const getRequestContext = (req: Request): RequestContext => {
    const userAgent = req.get("x-client-user-agent") ?? req.get("user-agent") ?? undefined;
    return { ip: getClientIp(req), userAgent, sessionId: req.user?.sessionId };
};
