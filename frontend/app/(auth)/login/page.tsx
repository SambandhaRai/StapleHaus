import { AuthSidePanel } from "@/app/(auth)/_components/auth-side-panel";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <main className="flex flex-1 flex-col lg:flex-row">
            <AuthSidePanel
                eyebrow="Members"
                title="Welcome back to the haus."
                description="Sign in to track orders, save your wishlist, and check out faster."
            />
            <section className="flex flex-1 items-center justify-center px-6 py-16 lg:w-1/2">
                <LoginForm error={error} />
            </section>
        </main>
    );
}
