import { daysUntilExpiry, shouldWarn, describeRemaining, URGENT_WITHIN_DAYS } from "@/lib/password-expiry";

export function PasswordExpiryBanner({ passwordExpiresAt }: { passwordExpiresAt?: string | null }) {
    const daysLeft = daysUntilExpiry(passwordExpiresAt);
    if (!shouldWarn(daysLeft)) return null;

    const urgent = daysLeft <= URGENT_WITHIN_DAYS;

    return (
        <div
            className="mb-10 border border-l-4 border-border p-6"
            style={{ borderLeftColor: urgent ? "var(--color-danger)" : "var(--color-ink)" }}
        >
            <p className="body-sm font-medium text-ink">{describeRemaining(daysLeft)}</p>
            <p className="body-sm mt-1 text-muted">
                Once it expires you will be asked to set a new one before you can sign in. Update it
                now from Change password below. You cannot reuse a recent password.
            </p>
        </div>
    );
}
