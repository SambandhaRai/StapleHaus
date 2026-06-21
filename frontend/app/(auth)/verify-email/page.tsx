import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailForm } from "./_components/verify-email-form";

export const metadata: Metadata = {
    title: "Verify Email",
};

export default function VerifyEmailPage() {
    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <Suspense>
                <VerifyEmailForm />
            </Suspense>
        </main>
    );
}
