const DAY_MS = 24 * 60 * 60 * 1000;

export const WARN_WITHIN_DAYS = 14;
export const URGENT_WITHIN_DAYS = 3;

export const daysUntilExpiry = (passwordExpiresAt?: string | null): number | null => {
    if (!passwordExpiresAt) return null;
    const expiresAt = new Date(passwordExpiresAt);
    if (Number.isNaN(expiresAt.getTime())) return null;
    return Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS);
};

export const shouldWarn = (daysLeft: number | null): daysLeft is number =>
    daysLeft !== null && daysLeft <= WARN_WITHIN_DAYS;

export const describeRemaining = (daysLeft: number): string => {
    if (daysLeft <= 0) return "Your password has expired.";
    if (daysLeft === 1) return "Your password expires tomorrow.";
    return `Your password expires in ${daysLeft} days.`;
};
