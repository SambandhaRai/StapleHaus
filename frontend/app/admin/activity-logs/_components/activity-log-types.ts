export type ActivityLogRecord = {
    _id: string;
    userId?: string;
    email?: string;
    action: string;
    status: "success" | "failure";
    ip?: string;
    userAgent?: string;
    reason?: string;
    createdAt: string;
};

export const ACTIVITY_ACTIONS = [
    "register",
    "login",
    "login_failed",
    "account_locked",
    "otp_verify",
    "otp_resend",
    "twofa_challenge",
    "twofa_enable",
    "twofa_disable",
    "google_login",
    "google_register",
    "google_login_failed",
    "logout",
    "password_change",
    "password_reset_request",
    "password_reset",
    "ip_access_add",
    "ip_access_remove",
];

export const ACTIVITY_STATUSES = ["success", "failure"];

export const PAGE_SIZE = 50;
