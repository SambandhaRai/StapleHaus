import type { Metadata } from "next";
import { TwoFactorLoginForm } from "../_components/two-factor-login-form";

export const metadata: Metadata = {
    title: "Two-step verification",
};

export default function TwoFactorLoginPage() {
    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <TwoFactorLoginForm />
        </main>
    );
}
