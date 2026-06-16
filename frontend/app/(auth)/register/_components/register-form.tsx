"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { BackButton } from "@/app/_components/back-button";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { handleLogin, handleRegister } from "@/lib/actions/auth-action";

const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (values: RegisterValues) => {
        const res = await handleRegister({
            name: values.name,
            email: values.email,
            password: values.password,
        });

        if (!res.success) {
            toast.error(res.message || "Registration failed");
            return;
        }

        const loginRes = await handleLogin({
            email: values.email,
            password: values.password,
        });

        if (loginRes.success) {
            toast.success("Account created — welcome!");
            router.push("/");
        } else {
            toast.info("Account created. Please sign in.");
            router.push("/login");
        }
        router.refresh();
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

                <Input
                    label="Password"
                    type="password"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                    Create Account
                </Button>
            </form>

            <p className="mt-8 text-xs leading-relaxed text-subtle">
                By creating an account, you agree to our{" "}
                <Link href="#" className="link-underline text-neutral-500">Terms of Use</Link>{" "}
                and{" "}
                <Link href="#" className="link-underline text-neutral-500">Privacy Policy</Link>.
            </p>
        </div>
    );
}
