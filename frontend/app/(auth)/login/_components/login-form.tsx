"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { PasswordField } from "../../_components/password-field";
import { GoogleSignInButton } from "../../_components/google-sign-in-button";
import { TurnstileWidget } from "../../_components/turnstile-widget";
import { handleLogin } from "@/lib/actions/auth-action";

const loginSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export function LoginForm() {
    const router = useRouter();
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaKey, setCaptchaKey] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values: LoginValues) => {
        if (captchaEnabled && !captchaToken) {
            toast.error("Please complete the captcha");
            return;
        }
        const res = await handleLogin({ ...values, captchaToken });
        if (res.success && res.twoFactorRequired) {
            router.push("/login/2fa");
            return;
        }
        if (res.success) {
            toast.success("Welcome back!");
            router.push(res.data?.role === "admin" ? "/admin" : "/");
            router.refresh();
            return;
        }
        setCaptchaToken("");
        setCaptchaKey((key) => key + 1);
        toast.error(res.message || "Login failed");
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

            <h1 className="h1 mb-2">Sign in</h1>
            <p className="body-sm mb-8 text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="link-underline font-medium text-ink">
                    Create one
                </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="password" className="label-caps text-neutral-700">
                            Password
                        </label>
                        <Link href="/forgot-password" className="link-underline text-xs text-neutral-500">
                            Forgot password?
                        </Link>
                    </div>
                    <PasswordField
                        id="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                </div>

                <TurnstileWidget
                    key={captchaKey}
                    onVerify={setCaptchaToken}
                    onExpire={() => setCaptchaToken("")}
                />

                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                    Sign In
                </Button>
            </form>

            <div className="mt-6">
                <GoogleSignInButton />
            </div>

            <p className="mt-8 text-xs leading-relaxed text-subtle">
                By signing in, you agree to our{" "}
                <Link href="#" className="link-underline text-neutral-500">Terms of Use</Link>{" "}
                and{" "}
                <Link href="#" className="link-underline text-neutral-500">Privacy Policy</Link>.
            </p>
        </div>
    );
}
