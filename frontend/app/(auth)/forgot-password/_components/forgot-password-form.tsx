"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { TurnstileWidget } from "../../_components/turnstile-widget";
import { handleForgotPassword } from "@/lib/actions/auth-action";

const forgotPasswordSchema = z.object({
    email: z.email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export function ForgotPasswordForm() {
    const [submitted, setSubmitted] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaKey, setCaptchaKey] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (values: ForgotPasswordValues) => {
        if (captchaEnabled && !captchaToken) {
            toast.error("Please complete the captcha");
            return;
        }
        const res = await handleForgotPassword(values.email, captchaToken);
        if (res.success) {
            setSubmitted(true);
            return;
        }
        setCaptchaToken("");
        setCaptchaKey((key) => key + 1);
        toast.error(res.message || "Could not send reset link");
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

            <h1 className="h1 mb-2">Forgot password</h1>
            <p className="body-sm mb-8 text-muted">
                Remembered it?{" "}
                <Link href="/login" className="link-underline font-medium text-ink">
                    Sign in
                </Link>
            </p>

            {submitted ? (
                <div className="space-y-4">
                    <p className="body-sm text-ink">
                        If an account exists for that email, we&apos;ve sent a password reset link.
                        It expires in 15 minutes.
                    </p>
                    <p className="body-sm text-muted">
                        Didn&apos;t get it? Check your spam folder, or try again in a few minutes.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <TurnstileWidget
                        key={captchaKey}
                        onVerify={setCaptchaToken}
                        onExpire={() => setCaptchaToken("")}
                    />

                    <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                        Send Reset Link
                    </Button>
                </form>
            )}
        </div>
    );
}
