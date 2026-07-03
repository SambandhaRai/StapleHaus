"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/app/_components/button";
import { PasswordField } from "@/app/(auth)/_components/password-field";
import { PasswordStrength, passwordIsStrong } from "@/app/(auth)/_components/password-strength";
import { handleChangePassword } from "@/lib/actions/users-action";

export function ChangePasswordManager() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const reset = () => {
        setOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const submit = async () => {
        if (!currentPassword) {
            toast.error("Enter your current password");
            return;
        }
        if (!passwordIsStrong(newPassword)) {
            toast.error("Your new password does not meet the requirements");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setBusy(true);
        const res = await handleChangePassword(currentPassword, newPassword);
        setBusy(false);
        if (!res.success) {
            toast.error(res.message || "Could not change password");
            return;
        }
        toast.success(res.message || "Password changed");
        reset();
    };

    return (
        <div className="border border-border p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="h4 mb-1">Password</h2>
                    <p className="body-sm text-muted">
                        Change your password. Your new password can&apos;t repeat a recent one.
                    </p>
                </div>
                {!open && (
                    <Button size="sm" onClick={() => setOpen(true)}>
                        Change
                    </Button>
                )}
            </div>

            {open && (
                <div className="mt-6 space-y-4">
                    <PasswordField
                        label="Current password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                    <div>
                        <PasswordField
                            label="New password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                        {newPassword.length > 0 && <PasswordStrength password={newPassword} />}
                    </div>
                    <PasswordField
                        label="Confirm new password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <div className="flex gap-3">
                        <Button size="sm" onClick={submit} isLoading={busy}>
                            Update password
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
