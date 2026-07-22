"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Button } from "@/app/_components/button";
import { PasswordField } from "../../_components/password-field";
import { PasswordStrength, passwordIsStrong } from "../../_components/password-strength";
import { handleChangeExpiredPassword } from "@/lib/actions/auth-action";

const expiredPasswordSchema = z
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

type ExpiredPasswordValues = z.infer<typeof expiredPasswordSchema>;

export function ExpiredPasswordForm() {
    const router = useRouter();
    const [passwordHelpVisible, setPasswordHelpVisible] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ExpiredPasswordValues>({
        resolver: zodResolver(expiredPasswordSchema),
    });
    const password = useWatch({ control, name: "password" }) || "";
    const passwordField = register("password");
    const showPasswordStrength = passwordHelpVisible || password.length > 0;

    const onSubmit = async (values: ExpiredPasswordValues) => {
        const res = await handleChangeExpiredPassword(values.password);
        if (res.success) {
            toast.success("Password updated. Welcome back!");
            router.push(res.data?.role === "admin" ? "/admin" : "/");
            router.refresh();
            return;
        }
        toast.error(res.message || "Could not update password");
    };

    return (
        <div className="w-full max-w-sm">
            <Link
                href="/"
                className="mb-8 block text-xl font-bold tracking-tight lg:hidden"
                style={{ fontFamily: "var(--font-display)" }}
            >
                STAPLEHAUS
            </Link>

            <h1 className="h1 mb-2">Update your password</h1>
            <p className="body-sm mb-8 text-muted">
                Your password has reached the maximum age allowed and must be changed before you
                can continue. You cannot reuse a recent password.
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
                    Update Password
                </Button>
            </form>

            <p className="body-sm mt-6 text-muted">
                <Link href="/login" className="link-underline font-medium text-ink">
                    Back to sign in
                </Link>
            </p>
        </div>
    );
}
