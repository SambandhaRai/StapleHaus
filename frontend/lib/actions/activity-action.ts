"use server";

import { getActivityLogs, type ActivityLogFilters } from "../api/activity";

export const handleGetActivityLogs = async (filters?: ActivityLogFilters) => {
    try {
        return await getActivityLogs(filters);
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load activity logs"
        };
    }
}
