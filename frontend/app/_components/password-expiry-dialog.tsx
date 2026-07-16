"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { daysUntilExpiry, shouldWarn, describeRemaining } from "@/lib/password-expiry";

const DISMISS_KEY = "password_expiry_dismissed";

export function PasswordExpiryDialog({ passwordExpiresAt }: { passwordExpiresAt?: string | null }) {
    const [visible, setVisible] = useState(false);
    const daysLeft = daysUntilExpiry(passwordExpiresAt);

    useEffect(() => {
        if (!shouldWarn(daysLeft) || !passwordExpiresAt) return;
        if (sessionStorage.getItem(DISMISS_KEY) === passwordExpiresAt) return;
        setVisible(true);
    }, [daysLeft, passwordExpiresAt]);

    const dismiss = () => {
        if (passwordExpiresAt) sessionStorage.setItem(DISMISS_KEY, passwordExpiresAt);
        setVisible(false);
    };

    if (!visible || !shouldWarn(daysLeft)) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="password-expiry-title"
                className="w-full max-w-sm border border-border bg-paper p-6 shadow-xl"
            >
                <h2 id="password-expiry-title" className="h4">
                    {describeRemaining(daysLeft)}
                </h2>
                <p className="body-sm mt-3 text-neutral-600">
                    Once it expires you will have to set a new password before you can sign in
                    again. You cannot reuse a recent password.
                </p>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={dismiss}
                        className="label-caps border border-border px-4 py-2.5 text-ink transition hover:border-ink"
                    >
                        Later
                    </button>
                    <Link
                        href="/account"
                        onClick={dismiss}
                        className="label-caps bg-ink px-4 py-2.5 text-paper transition hover:bg-neutral-800"
                    >
                        Update Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
