"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { OtpInput } from "../../_components/otp-input";
import { handleVerifyLoginTwoFactor } from "@/lib/actions/auth-action";

export function TwoFactorLoginForm() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [backupCode, setBackupCode] = useState("");
    const [useBackup, setUseBackup] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const submit = async (value: string) => {
        if (verifying) return;
        const trimmed = value.trim();
        if (!trimmed) {
            toast.error("Enter your authentication code");
            return;
        }

        setVerifying(true);
        const res = await handleVerifyLoginTwoFactor(trimmed);
        setVerifying(false);

        if (res.success && res.passwordExpired) {
            router.push("/login/password-expired");
            return;
        }

        if (res.success) {
            toast.success("Welcome back!");
            router.push(res.data?.role === "admin" ? "/admin" : "/");
            router.refresh();
            return;
        }

        setCode("");
        setBackupCode("");
        toast.error(res.message || "Verification failed");
    };

    return (
        <div className="w-full max-w-md">
            <BackButton className="mb-8" fallbackHref="/login" />

            <Link
                href="/"
                className="mb-8 block text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
            >
                STAPLEHAUS
            </Link>

            <h1 className="h1 mb-2">Two-step verification</h1>
            <p className="body-sm mb-8 text-muted">
                {useBackup
                    ? "Enter one of your saved backup codes."
                    : "Enter the 6-digit code from your authenticator app."}
            </p>

            {useBackup ? (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit(backupCode);
                    }}
                    className="space-y-6"
                >
                    <Input
                        label="Backup code"
                        type="text"
                        autoComplete="one-time-code"
                        value={backupCode}
                        onChange={(event) => setBackupCode(event.target.value)}
                    />
                    <Button type="submit" size="lg" fullWidth isLoading={verifying}>
                        Verify &amp; Continue
                    </Button>
                </form>
            ) : (
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit(code);
                    }}
                    className="space-y-6"
                >
                    <OtpInput value={code} onChange={setCode} onComplete={submit} disabled={verifying} />
                    <Button type="submit" size="lg" fullWidth isLoading={verifying}>
                        Verify &amp; Continue
                    </Button>
                </form>
            )}

            <p className="body-sm mt-6 text-muted">
                <button
                    type="button"
                    onClick={() => {
                        setUseBackup((prev) => !prev);
                        setCode("");
                        setBackupCode("");
                    }}
                    className="link-underline font-medium text-ink"
                >
                    {useBackup ? "Use authenticator app instead" : "Use a backup code"}
                </button>
            </p>
        </div>
    );
}
