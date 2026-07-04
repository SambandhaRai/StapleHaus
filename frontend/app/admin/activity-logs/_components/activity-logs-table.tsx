import type { ActivityLogRecord } from "./activity-log-types";

interface ActivityLogsTableProps {
    logs: ActivityLogRecord[];
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
    return (
        <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
                <thead className="border-b border-border bg-neutral-50">
                    <tr>
                        <th className="label-caps px-4 py-3 text-left text-muted">Time</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Action</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Status</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Email</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">IP</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log._id} className="border-b border-border/60 last:border-0">
                            <td className="whitespace-nowrap px-4 py-3 text-muted">
                                {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                            </td>
                            <td className="px-4 py-3 font-medium">{log.action}</td>
                            <td className="px-4 py-3">
                                <span
                                    className={
                                        log.status === "failure"
                                            ? "text-red-600"
                                            : "text-green-700"
                                    }
                                >
                                    {log.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-muted">{log.email || "—"}</td>
                            <td className="numeric px-4 py-3 text-muted">{log.ip || "—"}</td>
                            <td className="px-4 py-3 text-muted">{log.reason || "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
