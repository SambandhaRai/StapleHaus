import { handleControllerError } from "../errors/handle-controller-error";
import { ActivityLogService } from "../services/activity-log.service";
import { ActivityActionEnum, ActivityStatusEnum } from "../types/activity-log.type";
import { toCsv } from "../utils/csv";
import { Request, Response } from "express";

let activityLogService = new ActivityLogService();

const EXPORT_HEADERS = ["Date", "Action", "Status", "IP address", "Device", "Details"];

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

    async exportMyLogs(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const format = req.query.format === "json" ? "json" : "csv";
            const logs = await activityLogService.exportMyLogs(userId);
            const stamp = new Date().toISOString().slice(0, 10);
            const filename = `staplehaus-activity-${stamp}.${format}`;

            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("X-Content-Type-Options", "nosniff");

            if (format === "json") {
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                return res.status(200).send(JSON.stringify({
                    exportedAt: new Date().toISOString(),
                    count: logs.length,
                    activity: logs.map((log) => ({
                        date: log.createdAt ?? null,
                        action: log.action,
                        status: log.status,
                        ip: log.ip ?? null,
                        device: log.userAgent ?? null,
                        details: log.reason ?? null,
                    })),
                }, null, 2));
            }

            const rows = logs.map((log) => [
                log.createdAt ? new Date(log.createdAt).toISOString() : "",
                log.action,
                log.status,
                log.ip ?? "",
                log.userAgent ?? "",
                log.reason ?? "",
            ]);

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            return res.status(200).send(toCsv(EXPORT_HEADERS, rows));
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
