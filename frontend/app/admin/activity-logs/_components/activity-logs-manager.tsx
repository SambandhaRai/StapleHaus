"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { handleGetActivityLogs } from "@/lib/actions/activity-action";
import {
    ACTIVITY_ACTIONS,
    ACTIVITY_STATUSES,
    PAGE_SIZE,
    type ActivityLogRecord,
} from "./activity-log-types";
import { ActivityLogsTable } from "./activity-logs-table";

export function ActivityLogsManager() {
    const [logs, setLogs] = useState<ActivityLogRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [emailInput, setEmailInput] = useState("");
    const [email, setEmail] = useState("");
    const [action, setAction] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isCurrent = true;

        const load = async () => {
            setLoading(true);
            const res = await handleGetActivityLogs({
                email: email || undefined,
                action: action || undefined,
                status: status || undefined,
                page,
                limit: PAGE_SIZE,
            });
            if (!isCurrent) return;

            if (res.success) {
                setLogs(res.data || []);
                setTotal(res.meta?.total || 0);
            } else {
                toast.error(res.message || "Failed to load activity logs");
            }
            setLoading(false);
        };

        load();

        return () => {
            isCurrent = false;
        };
    }, [email, action, status, page]);

    const applyEmailFilter = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        setEmail(emailInput.trim());
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const selectClass =
        "border border-border bg-paper px-2 py-1.5 text-sm outline-none transition focus:border-ink";

    return (
        <div className="px-6 py-10 sm:px-10">
            <p className="eyebrow mb-2">Security</p>
            <h1 className="h1 mb-8">Activity Logs</h1>

            <div className="mb-6 flex flex-wrap items-end gap-3">
                <form onSubmit={applyEmailFilter} className="flex items-end gap-2">
                    <div>
                        <label className="label-caps mb-1 block text-muted">Email</label>
                        <input
                            value={emailInput}
                            onChange={(event) => setEmailInput(event.target.value)}
                            placeholder="Filter by email"
                            className={selectClass}
                        />
                    </div>
                    <button type="submit" className={`${selectClass} font-medium`}>
                        Search
                    </button>
                </form>

                <div>
                    <label className="label-caps mb-1 block text-muted">Action</label>
                    <select
                        value={action}
                        onChange={(event) => {
                            setPage(1);
                            setAction(event.target.value);
                        }}
                        className={selectClass}
                    >
                        <option value="">All</option>
                        {ACTIVITY_ACTIONS.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label-caps mb-1 block text-muted">Status</label>
                    <select
                        value={status}
                        onChange={(event) => {
                            setPage(1);
                            setStatus(event.target.value);
                        }}
                        className={selectClass}
                    >
                        <option value="">All</option>
                        {ACTIVITY_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="body-sm text-muted">Loading…</p>
            ) : logs.length === 0 ? (
                <p className="body-sm text-muted">No activity logs found.</p>
            ) : (
                <>
                    <ActivityLogsTable logs={logs} />
                    <div className="mt-6 flex items-center justify-between">
                        <p className="body-sm text-muted">
                            {total} {total === 1 ? "entry" : "entries"}
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className={`${selectClass} disabled:opacity-40`}
                            >
                                Previous
                            </button>
                            <span className="body-sm text-muted">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className={`${selectClass} disabled:opacity-40`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
