import { ActivityLogRepository } from "../repositories/activity-log.repository";
import { ActivityActionType, ActivityEvent, ActivityStatusType } from "../types/activity-log.type";
import { logger } from "../utils/logger";

let activityLogRepository = new ActivityLogRepository();

const MAX_USER_AGENT_LENGTH = 400;
const MAX_REASON_LENGTH = 200;

const USER_VISIBLE_ACTIONS: ActivityActionType[] = [
    "register",
    "login",
    "login_failed",
    "account_locked",
    "google_login",
    "logout",
    "otp_verify",
    "otp_resend",
    "twofa_challenge",
    "twofa_enable",
    "twofa_disable",
    "password_change",
    "password_expired_challenge",
    "password_reset_request",
    "password_reset",
    "order_placed",
    "payment_verified",
    "payment_failed",
    "order_expired",
];

export class ActivityLogService {

    async record(event: ActivityEvent): Promise<void> {
        try {
            await activityLogRepository.createLog({
                userId: event.userId,
                email: event.email,
                action: event.action,
                status: event.status,
                ip: event.ip,
                userAgent: event.userAgent?.slice(0, MAX_USER_AGENT_LENGTH),
                reason: event.reason?.slice(0, MAX_REASON_LENGTH),
            });
        } catch (error) {
            logger.error("Failed to write activity log", { error: String(error) });
        }
    }

    async getLogs(filters: {
        email?: string;
        action?: ActivityActionType;
        status?: ActivityStatusType;
        page: number;
        limit: number;
    }) {
        const page = Math.max(1, filters.page);
        const limit = Math.min(Math.max(1, filters.limit), 100);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            activityLogRepository.listLogs({
                email: filters.email,
                action: filters.action,
                status: filters.status,
                limit,
                skip,
            }),
            activityLogRepository.countLogs({
                email: filters.email,
                action: filters.action,
                status: filters.status,
            }),
        ]);

        return { logs, total, page, limit };
    }

    async getMyLogs(userId: string, filters: { page: number; limit: number }) {
        const page = Math.max(1, filters.page);
        const limit = Math.min(Math.max(1, filters.limit), 50);
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            activityLogRepository.listLogs({
                userId,
                actions: USER_VISIBLE_ACTIONS,
                limit,
                skip,
            }),
            activityLogRepository.countLogs({
                userId,
                actions: USER_VISIBLE_ACTIONS,
            }),
        ]);

        return { logs, total, page, limit };
    }
}
