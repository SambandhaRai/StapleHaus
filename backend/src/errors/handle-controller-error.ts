import { Response } from "express";

export const handleControllerError = (res: Response, error: any) => {
    const statusCode = error?.statusCode || 500;

    if (statusCode >= 500) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }

    return res.status(statusCode).json({
        success: false,
        message: error?.message || "Request failed",
    });
};
