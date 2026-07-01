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
]);

export const ActivityStatusEnum = z.enum(["success", "failure"]);

export type ActivityActionType = z.infer<typeof ActivityActionEnum>;
export type ActivityStatusType = z.infer<typeof ActivityStatusEnum>;

export type RequestContext = {
    ip?: string;
    userAgent?: string;
};

export type ActivityEvent = RequestContext & {
    action: ActivityActionType;
    status: ActivityStatusType;
    userId?: string;
    email?: string;
    reason?: string;
};
