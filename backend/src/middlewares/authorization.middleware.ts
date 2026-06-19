import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import { UserRoleType } from "../types/user.type";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

interface JwtPayload {
    id: string;
    email: string;
    role: UserRoleType;
}

export const authorizedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization token missing or malformed");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new HttpError(401, "Authorization token missing");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
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
