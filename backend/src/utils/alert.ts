import { sendEmail } from "../config/email";
import { ALERT_EMAIL } from "../config";

const ALERT_LEVELS = new Set(["fatal", "error"]);
const COOLDOWN_MS = 5 * 60 * 1000;

const lastSentByKey = new Map<string, number>();
const pending = new Set<Promise<unknown>>();

export const sendAlert = (level: string, message: string, meta?: Record<string, unknown>) => {
    if (!ALERT_LEVELS.has(level) || !ALERT_EMAIL) {
        return;
    }

    const key = `${level}:${message}`;
    const now = Date.now();
    if (now - (lastSentByKey.get(key) ?? 0) < COOLDOWN_MS) {
        return;
    }
    lastSentByKey.set(key, now);

    const metaText = meta ? JSON.stringify(meta, null, 2) : "";
    const timestamp = new Date().toISOString();
    const subject = `[StapleHaus] ${level.toUpperCase()}: ${message}`;
    const html = `
        <h2 style="color:#b00020; font-family:Helvetica,Arial,sans-serif;">${level.toUpperCase()} alert</h2>
        <p style="font-family:Helvetica,Arial,sans-serif;">${message}</p>
        ${metaText ? `<pre style="background:#f5f5f5; padding:12px; font-size:12px;">${metaText}</pre>` : ""}
        <p style="color:#888; font-family:Helvetica,Arial,sans-serif; font-size:12px;">${timestamp}</p>
    `;
    const text = `${level.toUpperCase()} alert: ${message}\n${metaText}\n${timestamp}`;

    const promise = sendEmail(ALERT_EMAIL, subject, html, text).catch(() => {
        // never let alerting crash the application
    });
    pending.add(promise);
    promise.finally(() => pending.delete(promise));
};

export const flushAlerts = async (): Promise<void> => {
    await Promise.allSettled([...pending]);
};
