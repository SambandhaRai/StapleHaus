import z from "zod";

export const ActivityActionEnum = z.enum([
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
    "logout",
    "password_change",
    "password_reset_request",
    "password_reset",
    "ip_access_add",
    "ip_access_remove",
]);

export const ActivityStatusEnum = z.enum(["success", "failure"]);

export type ActivityActionType = z.infer<typeof ActivityActionEnum>;
export type ActivityStatusType = z.infer<typeof ActivityStatusEnum>;

export type RequestContext = {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
};

export type ActivityEvent = RequestContext & {
    action: ActivityActionType;
    status: ActivityStatusType;
    userId?: string;
    email?: string;
    reason?: string;
};
