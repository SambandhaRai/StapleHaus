import axios from "./axios";
import { API } from "./endpoints";

export type ActivityLogFilters = {
    email?: string;
    action?: string;
    status?: string;
    page?: number;
    limit?: number;
};

export const getActivityLogs = async (filters?: ActivityLogFilters) => {
    try {
        const response = await axios.get(
            API.ADMIN.ACTIVITY_LOGS(filters)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load activity logs"
        );
    }
}
