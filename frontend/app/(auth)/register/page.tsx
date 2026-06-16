import { AuthSidePanel } from "@/app/(auth)/_components/auth-side-panel";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
    return (
        <main className="flex flex-1 flex-col lg:flex-row">
            <AuthSidePanel
                eyebrow="New here"
                title="Join the haus."
                description="Create an account to shop the latest, build a wishlist, and breeze through checkout."
            />
            <section className="flex flex-1 items-center justify-center px-6 py-16 lg:w-1/2">
                <RegisterForm />
            </section>
        </main>
    );
}
