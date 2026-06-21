"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { OtpInput } from "@/app/(auth)/_components/otp-input";
import {
    handleSetupTwoFactor,
    handleEnableTwoFactor,
    handleDisableTwoFactor,
} from "@/lib/actions/users-action";

type Step = "idle" | "setup" | "backup" | "disable";

interface TwoFactorManagerProps {
    initialEnabled: boolean;
}

export function TwoFactorManager({ initialEnabled }: TwoFactorManagerProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [step, setStep] = useState<Step>("idle");
    const [busy, setBusy] = useState(false);

    const [otpauthUri, setOtpauthUri] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [password, setPassword] = useState("");

    const reset = () => {
        setStep("idle");
        setOtpauthUri("");
        setSecret("");
        setCode("");
        setBackupCodes([]);
        setPassword("");
    };

    const startSetup = async () => {
        setBusy(true);
        const res = await handleSetupTwoFactor();
        setBusy(false);
        if (!res.success || !res.data) {
            toast.error(res.message || "Failed to start setup");
            return;
        }
        setOtpauthUri(res.data.otpauthUri);
        setSecret(res.data.secret);
        setCode("");
        setStep("setup");
    };

    const confirmEnable = async () => {
        if (!/^\d{6}$/.test(code)) {
            toast.error("Enter the 6-digit code");
            return;
        }
        setBusy(true);
        const res = await handleEnableTwoFactor(code);
        setBusy(false);
        if (!res.success) {
            toast.error(res.message || "Invalid code");
            setCode("");
            return;
        }
        setBackupCodes(res.data?.backupCodes || []);
        setEnabled(true);
        setStep("backup");
        toast.success("Two-factor authentication enabled");
    };

    const confirmDisable = async () => {
        if (!password) {
            toast.error("Enter your password");
            return;
        }
        setBusy(true);
        const res = await handleDisableTwoFactor(password);
        setBusy(false);
        if (!res.success) {
            toast.error(res.message || "Failed to disable");
            return;
        }
        setEnabled(false);
        reset();
        toast.success("Two-factor authentication disabled");
    };

    const copyBackupCodes = async () => {
        try {
            await navigator.clipboard.writeText(backupCodes.join("\n"));
            toast.success("Backup codes copied");
        } catch {
            toast.error("Could not copy, please save them manually");
        }
    };

    return (
        <div className="border border-border p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="h4 mb-1">Two-factor authentication</h2>
                    <p className="body-sm text-muted">
                        {enabled
                            ? "An authenticator code is required when you sign in."
                            : "Add an authenticator app for an extra layer of security."}
                    </p>
                </div>
                <span
                    className={`label-caps shrink-0 border px-2 py-1 text-[0.6rem] ${
                        enabled ? "border-ink text-ink" : "border-border text-subtle"
                    }`}
                >
                    {enabled ? "On" : "Off"}
                </span>
            </div>

            {step === "idle" && (
                <div className="mt-5">
                    {enabled ? (
                        <Button variant="secondary" size="sm" onClick={() => setStep("disable")}>
                            Disable
                        </Button>
                    ) : (
                        <Button size="sm" onClick={startSetup} isLoading={busy}>
                            Enable
                        </Button>
                    )}
                </div>
            )}

            {step === "setup" && (
                <div className="mt-6 space-y-5">
                    <p className="body-sm text-muted">
                        Scan this with your authenticator app, then enter the 6-digit code to confirm.
                    </p>
                    <div className="flex justify-center border border-border bg-paper p-4">
                        <QRCodeSVG value={otpauthUri} size={160} />
                    </div>
                    <div>
                        <p className="label-caps mb-1 text-neutral-700">Can&apos;t scan? Enter this key</p>
                        <p className="numeric break-all border border-border bg-neutral-50 px-3 py-2 text-sm">
                            {secret}
                        </p>
                    </div>
                    <OtpInput value={code} onChange={setCode} onComplete={() => confirmEnable()} disabled={busy} />
                    <div className="flex gap-3">
                        <Button size="sm" onClick={confirmEnable} isLoading={busy}>
                            Confirm &amp; enable
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset} disabled={busy}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {step === "backup" && (
                <div className="mt-6 space-y-4">
                    <p className="body-sm text-muted">
                        Save these backup codes somewhere safe. Each one can be used once if you lose your
                        authenticator. They won&apos;t be shown again.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((c) => (
                            <span key={c} className="numeric border border-border bg-neutral-50 px-3 py-2 text-center text-sm">
                                {c}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="sm" onClick={copyBackupCodes}>
                            Copy codes
                        </Button>
                        <Button size="sm" onClick={reset}>
                            Done
                        </Button>
                    </div>
                </div>
            )}

            {step === "disable" && (
                <div className="mt-6 space-y-4">
                    <p className="body-sm text-muted">Enter your password to turn off two-factor authentication.</p>
                    <Input
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <div className="flex gap-3">
                        <Button variant="secondary" size="sm" onClick={confirmDisable} isLoading={busy}>
                            Disable 2FA
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset} disabled={busy}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
