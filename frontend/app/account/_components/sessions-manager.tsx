"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/app/_components/button";
import { handleGetSessions, handleRevokeSession, handleRevokeOtherSessions } from "@/lib/actions/users-action";

type Session = {
    _id: string;
    userAgent?: string;
    ip?: string;
    lastUsedAt?: string;
    createdAt?: string;
    current?: boolean;
};

interface SessionsManagerProps {
    initialSessions: Session[];
}

const describeDevice = (userAgent?: string) => {
    if (!userAgent) return "Unknown device";

    const browser = /Edg/.test(userAgent) ? "Edge"
        : /Chrome/.test(userAgent) ? "Chrome"
        : /Firefox/.test(userAgent) ? "Firefox"
        : /Safari/.test(userAgent) ? "Safari"
        : "Browser";

    const os = /Windows/.test(userAgent) ? "Windows"
        : /iPhone|iPad|iOS/.test(userAgent) ? "iOS"
        : /Mac OS X|Macintosh/.test(userAgent) ? "macOS"
        : /Android/.test(userAgent) ? "Android"
        : /Linux/.test(userAgent) ? "Linux"
        : "Unknown OS";

    return `${browser} on ${os}`;
};

const formatWhen = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
};

export function SessionsManager({ initialSessions }: SessionsManagerProps) {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [busyAll, setBusyAll] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const refresh = async () => {
        const res = await handleGetSessions();
        if (res.success && Array.isArray(res.data)) {
            setSessions(res.data);
        }
    };

    const revokeOne = async (sessionId: string) => {
        setBusyId(sessionId);
        const res = await handleRevokeSession(sessionId);
        setBusyId(null);
        if (!res.success) {
            toast.error(res.message || "Could not sign out this session");
            return;
        }
        toast.success("Signed out that device");
        await refresh();
    };

    const revokeAll = async () => {
        setBusyAll(true);
        const res = await handleRevokeOtherSessions();
        setBusyAll(false);
        if (!res.success) {
            toast.error(res.message || "Could not sign out other sessions");
            return;
        }
        toast.success("Signed out all other devices");
        await refresh();
    };

    const otherCount = sessions.filter((session) => !session.current).length;

    return (
        <div className="border border-border p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="h4 mb-1">Active sessions</h2>
                    <p className="body-sm text-muted">
                        Devices currently signed in to your account. Sign out any you don&apos;t recognise.
                    </p>
                </div>
                {otherCount > 0 && (
                    <Button variant="secondary" size="sm" onClick={revokeAll} isLoading={busyAll}>
                        Sign out others
                    </Button>
                )}
            </div>

            <ul className="mt-6 divide-y divide-border">
                {sessions.map((session) => (
                    <li key={session._id} className="flex items-center justify-between gap-4 py-4">
                        <div>
                            <p className="body-sm flex items-center gap-2 font-medium">
                                {describeDevice(session.userAgent)}
                                {session.current && (
                                    <span className="label-caps border border-ink px-2 py-0.5 text-[0.6rem] text-ink">
                                        This device
                                    </span>
                                )}
                            </p>
                            <p className="body-sm text-muted">
                                {session.ip ? `${session.ip} · ` : ""}Last active {mounted ? formatWhen(session.lastUsedAt) : "…"}
                            </p>
                        </div>
                        {!session.current && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeOne(session._id)}
                                isLoading={busyId === session._id}
                            >
                                Sign out
                            </Button>
                        )}
                    </li>
                ))}
                {sessions.length === 0 && (
                    <li className="py-4">
                        <p className="body-sm text-muted">No active sessions found.</p>
                    </li>
                )}
            </ul>
        </div>
    );
}
