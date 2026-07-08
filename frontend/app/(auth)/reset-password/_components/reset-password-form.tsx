"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/app/_components/button";
import { PasswordField } from "../../_components/password-field";
import { PasswordStrength, passwordIsStrong } from "../../_components/password-strength";
import { handleResetPassword } from "@/lib/actions/auth-action";

const resetPasswordSchema = z
    .object({
        password: z.string()
            .max(128, "Password must be 128 characters or fewer")
            .refine(passwordIsStrong, {
                message: "Password does not meet the security requirements",
            }),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [passwordHelpVisible, setPasswordHelpVisible] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
    });
    const password = useWatch({ control, name: "password" }) || "";
    const passwordField = register("password");
    const showPasswordStrength = passwordHelpVisible || password.length > 0;

    const onSubmit = async (values: ResetPasswordValues) => {
        const res = await handleResetPassword(token, values.password);
        if (res.success) {
            toast.success("Password reset. Sign in with your new password");
            router.push("/login");
            return;
        }
        toast.error(res.message || "Password reset failed");
    };

    return (
        <div className="w-full max-w-sm">
            <BackButton className="mb-8" />

            <Link
                href="/"
                className="mb-8 block text-xl font-bold tracking-tight lg:hidden"
                style={{ fontFamily: "var(--font-display)" }}
            >
                STAPLEHAUS
            </Link>

            <h1 className="h1 mb-2">Reset password</h1>

            {token ? (
                <>
                    <p className="body-sm mb-8 text-muted">
                        Choose a new password for your account.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <PasswordField
                            label="New Password"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            error={errors.password?.message}
                            {...passwordField}
                            onFocus={() => setPasswordHelpVisible(true)}
                            onBlur={(event) => {
                                passwordField.onBlur(event);
                                setPasswordHelpVisible(false);
                            }}
                        />
                        {showPasswordStrength ? <PasswordStrength password={password} /> : null}

                        <PasswordField
                            label="Confirm New Password"
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />

                        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                            Reset Password
                        </Button>
                    </form>
                </>
            ) : (
                <div className="space-y-4">
                    <p className="body-sm text-ink">
                        This reset link is invalid or incomplete.
                    </p>
                    <p className="body-sm text-muted">
                        <Link href="/forgot-password" className="link-underline font-medium text-ink">
                            Request a new reset link
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}
