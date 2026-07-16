"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/app/_components/button";
import { handleGetActivityLogs } from "@/lib/actions/users-action";
import { describeDevice } from "@/lib/device";
import { formatWhen } from "@/lib/format";

export type ActivityLog = {
    _id: string;
    action: string;
    status: "success" | "failure";
    ip?: string;
    userAgent?: string;
    reason?: string;
    createdAt?: string;
};

interface ActivityLogManagerProps {
    initialLogs: ActivityLog[];
    initialTotal: number;
    pageSize: number;
}

const ACTION_LABELS: Record<string, string> = {
    register: "Account created",
    login: "Signed in",
    login_failed: "Failed sign-in attempt",
    account_locked: "Account locked",
    google_login: "Signed in with Google",
    logout: "Signed out",
    otp_verify: "Email verification code checked",
    otp_resend: "Verification code resent",
    twofa_challenge: "Two-step code requested",
    twofa_enable: "Two-factor authentication enabled",
    twofa_disable: "Two-factor authentication disabled",
    password_change: "Password changed",
    password_expired_challenge: "Password expired",
    password_reset_request: "Password reset requested",
    password_reset: "Password reset",
    order_placed: "Order placed",
    payment_verified: "Payment confirmed",
    payment_failed: "Payment failed",
    order_expired: "Order expired before payment",
};

const describeAction = (action: string) => ACTION_LABELS[action] ?? action.replace(/_/g, " ");

export function ActivityLogManager({ initialLogs, initialTotal, pageSize }: ActivityLogManagerProps) {
    const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadMore = async () => {
        const nextPage = page + 1;
        setLoading(true);
        const res = await handleGetActivityLogs(nextPage, pageSize);
        setLoading(false);

        if (!res.success || !Array.isArray(res.data)) {
            toast.error(res.message || "Could not load more activity");
            return;
        }
        setLogs((current) => [...current, ...(res.data as ActivityLog[])]);
        setTotal(res.meta?.total ?? total);
        setPage(nextPage);
    };

    return (
        <div className="border border-border p-6">
            <p className="body-sm text-muted">
                Security and order events on your account. If you see something you don&apos;t
                recognise, change your password and sign out other devices.
            </p>

            <ul className="mt-6 divide-y divide-border">
                {logs.map((log) => (
                    <li key={log._id} className="flex items-start justify-between gap-4 py-4">
                        <div>
                            <p className="body-sm flex items-center gap-2 font-medium">
                                {describeAction(log.action)}
                                {log.status === "failure" && (
                                    <span
                                        className="label-caps border px-2 py-0.5 text-[0.6rem]"
                                        style={{
                                            color: "var(--color-danger)",
                                            borderColor: "var(--color-danger)",
                                        }}
                                    >
                                        Failed
                                    </span>
                                )}
                            </p>
                            <p className="body-sm text-muted">
                                {describeDevice(log.userAgent)}
                                {log.ip ? ` · ${log.ip}` : ""}
                            </p>
                        </div>
                        <p className="body-sm shrink-0 text-muted">
                            {mounted ? formatWhen(log.createdAt) : "…"}
                        </p>
                    </li>
                ))}
                {logs.length === 0 && (
                    <li className="py-4">
                        <p className="body-sm text-muted">No activity recorded yet.</p>
                    </li>
                )}
            </ul>

            {logs.length < total && (
                <div className="mt-6">
                    <Button variant="secondary" size="sm" onClick={loadMore} isLoading={loading}>
                        Load more
                    </Button>
                </div>
            )}
        </div>
    );
}
