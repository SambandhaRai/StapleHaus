import { handleControllerError } from "../errors/handle-controller-error";
import { SessionService } from "../services/session.service";
import { Request, Response } from "express";

let sessionService = new SessionService();

export class SessionController {

    async listSessions(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const sessions = await sessionService.listSessions(userId);
            const data = sessions.map((session) => ({
                ...session.toJSON(),
                current: session._id.toString() === req.user?.sessionId,
            }));
            return res.status(200).json({
                success: true,
                data,
                message: "Sessions fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async revokeSession(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const sessionId = req.params.id as string;
            await sessionService.revokeSessionForUser(sessionId, userId);
            return res.status(200).json({
                success: true,
                message: "Session revoked successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async revokeOtherSessions(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await sessionService.revokeOtherSessions(userId, req.user?.sessionId);
            return res.status(200).json({
                success: true,
                message: "All other sessions have been signed out"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
