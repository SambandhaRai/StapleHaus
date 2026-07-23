import { cache } from "react";
import { getAuthToken } from "./cookie";
import { handleGetProfile } from "./actions/users-action";

export interface CurrentUser {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    passwordExpiresAt?: string;
    [key: string]: unknown;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
    const token = await getAuthToken();
    if (!token) return null;

    const res = await handleGetProfile();
    const parsed = res as { success?: boolean; data?: CurrentUser };
    if (parsed.success && parsed.data) return parsed.data;

    return null;
});
