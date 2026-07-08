import { AuthSidePanel } from "@/app/(auth)/_components/auth-side-panel";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export default function ForgotPasswordPage() {
    return (
        <main className="flex flex-1 flex-col lg:flex-row">
            <AuthSidePanel
                eyebrow="Account"
                title="Locked out of the haus?"
                description="Enter your email and we'll send you a link to reset your password."
            />
            <section className="flex flex-1 items-center justify-center px-6 py-16 lg:w-1/2">
                <ForgotPasswordForm />
            </section>
        </main>
    );
}
