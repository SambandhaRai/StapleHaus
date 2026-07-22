import { PASSWORD_MAX_AGE_DAYS } from "../config";

const DAY_MS = 24 * 60 * 60 * 1000;

export const computePasswordExpiresAt = (
    password: string | undefined,
    passwordChangedAt: Date | undefined,
    createdAt: Date | undefined,
): Date | null => {
    if (PASSWORD_MAX_AGE_DAYS <= 0 || !password) {
        return null;
    }
    const changedAt = passwordChangedAt ?? createdAt;
    if (!changedAt) {
        return null;
    }
    return new Date(changedAt.getTime() + PASSWORD_MAX_AGE_DAYS * DAY_MS);
};
