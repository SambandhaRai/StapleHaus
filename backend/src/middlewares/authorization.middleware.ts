import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import { UserRoleType } from "../types/user.type";
import { UserRepository } from "../repositories/user.repository";
import { SessionService } from "../services/session.service";
import { getRequestContext } from "../utils/request-context";

const userRepository = new UserRepository();
const sessionService = new SessionService();

interface JwtPayload {
    id: string;
    email: string;
    role: UserRoleType;
    purpose?: string;
    jti?: string;
}

export const authorizedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization token missing or malformed");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new HttpError(401, "Authorization token missing");
        }

        // jwt.verify() rejects a forged/modified signature and, since no
        // "algorithms" override is passed, also rejects an attacker-crafted
        // {"alg":"none"} token via the library's own safe default.
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // A JWT can be valid but issued for a different purpose (e.g. a 2FA
        // challenge or password-reset token) — reject anything that isn't a
        // real login session token from being used as one.
        if (decoded.purpose !== "session") {
            throw new HttpError(401, "Invalid token");
        }

        // Session hijacking / stale-token prevention: a JWT can stay
        // cryptographically valid after logout, so every request is checked
        // against a server-side session record too. This is what actually
        // lets logout, device-mismatch, and idle-timeout revoke access even
        // though the JWT itself hasn't expired yet (see session.service.ts).
        const session = await sessionService.validateSession(decoded.jti, decoded.id, getRequestContext(req));
        if (!session) {
            throw new HttpError(401, "Session expired or revoked");
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            sessionId: session._id.toString(),
        };

        next();
    } catch (error: any) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Authentication failed",
        });
    }
};

export const adminOnlyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        // Broken-access-control / privilege-escalation prevention: the role is
        // re-read from the database instead of trusting decoded.role from the
        // JWT payload, so a demoted admin's still-valid token (or a tampered
        // claim) can't be used to keep or gain admin access.
        const user = await userRepository.getUserById(req.user.id);
        if (!user || user.role !== "admin") {
            throw new HttpError(403, "Admin access required");
        }

        next();
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Authorization failed",
        });
    }
};
