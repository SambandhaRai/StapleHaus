import { Request } from "express";
import { RequestContext } from "../types/activity-log.type";

export const getRequestContext = (req: Request): RequestContext => {
    const clientIp = req.get("x-client-ip");
    const ip = clientIp ? clientIp.split(",")[0].trim() : req.ip;
    const userAgent = req.get("x-client-user-agent") ?? req.get("user-agent") ?? undefined;
    return { ip: ip ?? undefined, userAgent, sessionId: req.user?.sessionId };
};
