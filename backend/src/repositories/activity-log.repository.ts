import { IActivityLog, ActivityLogModel } from "../models/activity-log.model";
import { ActivityActionType, ActivityStatusType } from "../types/activity-log.type";

type CreateActivityLogData = {
    userId?: string;
    email?: string;
    action: ActivityActionType;
    status: ActivityStatusType;
    ip?: string;
    userAgent?: string;
    reason?: string;
};

type ListActivityLogFilters = {
    email?: string;
    action?: ActivityActionType;
    status?: ActivityStatusType;
    limit: number;
    skip: number;
};

export interface IActivityLogRepository {
    createLog(data: CreateActivityLogData): Promise<IActivityLog>;
    listLogs(filters: ListActivityLogFilters): Promise<IActivityLog[]>;
    countLogs(filters: Omit<ListActivityLogFilters, "limit" | "skip">): Promise<number>;
}

export class ActivityLogRepository implements IActivityLogRepository {

    async createLog(data: CreateActivityLogData): Promise<IActivityLog> {
        return await ActivityLogModel.create(data);
    }

    async listLogs(filters: ListActivityLogFilters): Promise<IActivityLog[]> {
        return await ActivityLogModel.find(this.buildQuery(filters))
            .sort({ createdAt: -1 })
            .skip(filters.skip)
            .limit(filters.limit);
    }

    async countLogs(filters: Omit<ListActivityLogFilters, "limit" | "skip">): Promise<number> {
        return await ActivityLogModel.countDocuments(this.buildQuery(filters));
    }

    private buildQuery(filters: Partial<ListActivityLogFilters>) {
        const query: Record<string, unknown> = {};
        if (filters.email) query.email = filters.email.trim().toLowerCase();
        if (filters.action) query.action = filters.action;
        if (filters.status) query.status = filters.status;
        return query;
    }
}
