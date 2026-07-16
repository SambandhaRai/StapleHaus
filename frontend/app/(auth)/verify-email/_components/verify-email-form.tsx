"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/app/_components/button";
import { OtpInput } from "../../_components/otp-input";
import { RecaptchaWidget } from "../../_components/recaptcha-widget";
import { handleResendOtp, handleVerifyOtp } from "@/lib/actions/auth-action";

const RESEND_COOLDOWN = 30;
const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

export function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [otp, setOtp] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(email ? RESEND_COOLDOWN : 0);
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaKey, setCaptchaKey] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const verify = async (code: string) => {
        if (!email || verifying) return;
        if (!/^\d{6}$/.test(code)) {
            toast.error("Enter the 6-digit code");
            return;
        }

        setVerifying(true);
        const res = await handleVerifyOtp(email, code);
        setVerifying(false);

        if (res.success) {
            toast.success("Account verified, Registration Successful");
            router.push(res.data?.role === "admin" ? "/admin" : "/");
            router.refresh();
            return;
        }

        toast.error(res.message || "Verification failed");
        setOtp("");
    };

    const onResend = async () => {
        if (!email || resending || cooldown > 0) return;
        if (captchaEnabled && !captchaToken) {
            toast.error("Please complete the captcha");
            return;
        }

        setResending(true);
        const res = await handleResendOtp(email, captchaToken);
        setResending(false);
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);

        if (res.success) {
            setOtp("");
            setCooldown(RESEND_COOLDOWN);
            toast.success(res.message);
            return;
        }

        toast.error(res.message);
    };

    return (
        <div className="w-full max-w-sm">
            <BackButton className="mb-8" fallbackHref="/register" />

            <Link
                href="/"
                className="mb-8 block text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
            >
                STAPLEHAUS
            </Link>

            <h1 className="h1 mb-2">Check your inbox</h1>
            {email ? (
                <p className="body-sm mb-8 text-muted">
                    Enter the 6-digit code we sent to{" "}
                    <span className="font-medium text-ink">{email}</span>.
                </p>
            ) : (
                <p className="body-sm mb-8 text-muted">
                    We need your email before we can verify your account.
                </p>
            )}

            {email ? (
                <>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            verify(otp);
                        }}
                        className="space-y-6"
                    >
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            onComplete={verify}
                            disabled={verifying}
                        />

                        <Button type="submit" size="lg" fullWidth isLoading={verifying}>
                            Verify &amp; Continue
                        </Button>
                    </form>

                    {cooldown > 0 ? null : (
                        <div className="mt-6">
                            <RecaptchaWidget key={captchaKey} onVerify={setCaptchaToken} />
                        </div>
                    )}

                    <p className="body-sm mt-6 text-muted">
                        Didn&apos;t get the code?{" "}
                        {cooldown > 0 ? (
                            <span className="numeric text-subtle">Resend in {cooldown}s</span>
                        ) : (
                            <button
                                type="button"
                                onClick={onResend}
                                disabled={resending}
                                className="link-underline font-medium text-ink disabled:opacity-50"
                            >
                                {resending ? "Sending…" : "Resend code"}
                            </button>
                        )}
                    </p>
                </>
            ) : (
                <Button type="button" size="lg" fullWidth onClick={() => router.push("/register")}>
                    Create Account
                </Button>
            )}
        </div>
    );
}
