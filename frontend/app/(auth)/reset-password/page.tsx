import { AuthSidePanel } from "@/app/(auth)/_components/auth-side-panel";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    return (
        <main className="flex flex-1 flex-col lg:flex-row">
            <AuthSidePanel
                eyebrow="Account"
                title="Choose a new password."
                description="Pick something strong you haven't used here before."
            />
            <section className="flex flex-1 items-center justify-center px-6 py-16 lg:w-1/2">
                <ResetPasswordForm token={token ?? ""} />
            </section>
        </main>
    );
}
