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
import { Input } from "@/app/_components/input";
import { PasswordField } from "../../_components/password-field";
import { PasswordStrength, passwordIsStrong } from "../../_components/password-strength";
import { GoogleSignInButton } from "../../_components/google-sign-in-button";
import { TurnstileWidget } from "../../_components/turnstile-widget";
import { handleRegister } from "@/lib/actions/auth-action";

const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Enter a valid email"),
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

type RegisterValues = z.infer<typeof registerSchema>;

const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export function RegisterForm() {
    const router = useRouter();
    const [passwordHelpVisible, setPasswordHelpVisible] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });
    const password = useWatch({ control, name: "password" }) || "";
    const passwordField = register("password");
    const showPasswordStrength = passwordHelpVisible || password.length > 0;

    const onSubmit = async (values: RegisterValues) => {
        if (captchaEnabled && !captchaToken) {
            toast.error("Please complete the captcha");
            return;
        }

        const res = await handleRegister({
            name: values.name,
            email: values.email,
            password: values.password,
            captchaToken,
        });

        if (!res.success) {
            toast.error(res.message || "Registration failed");
            return;
        }

        toast.success("We sent a verification code to your email");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
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

            <h1 className="h1 mb-2">Create account</h1>
            <p className="body-sm mb-8 text-muted">
                Already have an account?{" "}
                <Link href="/login" className="link-underline font-medium text-ink">
                    Sign in
                </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Name"
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    error={errors.name?.message}
                    {...register("name")}
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <PasswordField
                    label="Password"
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
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <TurnstileWidget onVerify={setCaptchaToken} />

                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                    Create Account
                </Button>
            </form>

            <div className="mt-6">
                <GoogleSignInButton />
            </div>

            <p className="mt-8 text-xs leading-relaxed text-subtle">
                By creating an account, you agree to our{" "}
                <Link href="#" className="link-underline text-neutral-500">Terms of Use</Link>{" "}
                and{" "}
                <Link href="#" className="link-underline text-neutral-500">Privacy Policy</Link>.
            </p>
        </div>
    );
}
