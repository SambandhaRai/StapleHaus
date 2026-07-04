import { Request, Response, NextFunction } from "express";
import { IpAccessService } from "../services/ip-access.service";
import { getClientIp } from "../utils/request-context";

const ipAccessService = new IpAccessService();

export const ipAccessMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ip = getClientIp(req);
        if (!ip) {
            return next();
        }

        const mode = await ipAccessService.getMode(ip);
        if (mode === "block") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        if (mode === "allow") {
            req.ipAllowlisted = true;
        }

        return next();
    } catch (error) {
        console.error("IP access check failed", error);
        return next();
    }
};
