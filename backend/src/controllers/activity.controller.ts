import { handleControllerError } from "../errors/handle-controller-error";
import { ActivityLogService } from "../services/activity-log.service";
import { ActivityActionEnum, ActivityStatusEnum } from "../types/activity-log.type";
import { Request, Response } from "express";

let activityLogService = new ActivityLogService();

export class ActivityController {

    async getLogs(req: Request, res: Response) {
        try {
            const email = typeof req.query.email === "string" ? req.query.email : undefined;
            const actionParam = typeof req.query.action === "string" ? req.query.action : undefined;
            const statusParam = typeof req.query.status === "string" ? req.query.status : undefined;
            const page = parseInt(typeof req.query.page === "string" ? req.query.page : "1") || 1;
            const limit = parseInt(typeof req.query.limit === "string" ? req.query.limit : "50") || 50;

            const action = ActivityActionEnum.safeParse(actionParam).success ? actionParam as any : undefined;
            const status = ActivityStatusEnum.safeParse(statusParam).success ? statusParam as any : undefined;

            const result = await activityLogService.getLogs({ email, action, status, page, limit });

            return res.status(200).json({
                success: true,
                data: result.logs,
                meta: { total: result.total, page: result.page, limit: result.limit },
                message: "Activity logs fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async getMyLogs(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const page = parseInt(typeof req.query.page === "string" ? req.query.page : "1") || 1;
            const limit = parseInt(typeof req.query.limit === "string" ? req.query.limit : "20") || 20;

            const result = await activityLogService.getMyLogs(userId, { page, limit });

            return res.status(200).json({
                success: true,
                data: result.logs,
                meta: { total: result.total, page: result.page, limit: result.limit },
                message: "Activity logs fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
