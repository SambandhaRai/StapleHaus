import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPasswordExpiredChallenge } from "@/lib/cookie";
import { ExpiredPasswordForm } from "../_components/expired-password-form";

export const metadata: Metadata = {
    title: "Update your password",
};

export default async function PasswordExpiredPage() {
    const expiredToken = await getPasswordExpiredChallenge();
    if (!expiredToken) {
        redirect("/login");
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <ExpiredPasswordForm />
        </main>
    );
}
