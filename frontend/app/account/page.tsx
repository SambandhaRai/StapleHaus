import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/cookie";
import { LogoutButton } from "@/app/_components/logout-button";
import { TwoFactorManager } from "./_components/two-factor-manager";
import { SessionsManager } from "./_components/sessions-manager";
import { ChangePasswordManager } from "./_components/change-password-manager";
import { handleGetProfile, handleGetSessions } from "@/lib/actions/users-action";

type ProfileUser = { name?: string; email?: string; twoFactorEnabled?: boolean; hasPassword?: boolean };

const extractUser = (res: unknown): ProfileUser | null => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: ProfileUser };
        if (result.success && result.data) return result.data;
    }
    return null;
};

export default async function AccountPage() {
    const authToken = await getAuthToken();
    if (!authToken) {
        redirect("/login");
    }

    const user = extractUser(await handleGetProfile());
    if (!user) {
        redirect("/login");
    }

    const sessionsResult = await handleGetSessions();
    const sessions = sessionsResult.success && Array.isArray(sessionsResult.data) ? sessionsResult.data : [];

    return (
        <main className="flex flex-1 flex-col bg-background text-foreground">
            <div className="border-b border-border">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Link
                        href="/"
                        className="text-xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        STAPLEHAUS
                    </Link>
                    <Link href="/" className="label-caps link-underline">
                        Back to store
                    </Link>
                </div>
            </div>

            <div className="mx-auto w-full max-w-5xl px-6 py-14">
                <p className="eyebrow mb-3">Account</p>
                <h1 className="h1 mb-2">Hi, {user.name}</h1>
                <p className="body-sm mb-12 text-muted">{user.email}</p>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Link
                        href="/orders"
                        className="border border-border p-6 transition hover:border-ink"
                    >
                        <h2 className="h4 mb-1">Orders</h2>
                        <p className="body-sm text-muted">Track and review your orders.</p>
                    </Link>
                    <Link
                        href="/account/addresses"
                        className="border border-border p-6 transition hover:border-ink"
                    >
                        <h2 className="h4 mb-1">Addresses</h2>
                        <p className="body-sm text-muted">Manage your shipping addresses.</p>
                    </Link>
                    <Link
                        href="/wishlist"
                        className="border border-border p-6 transition hover:border-ink"
                    >
                        <h2 className="h4 mb-1">Wishlist</h2>
                        <p className="body-sm text-muted">Pieces you&apos;ve saved for later.</p>
                    </Link>
                </div>

                <div className="mt-12 border-t border-border pt-8">
                    <p className="eyebrow mb-4">Security</p>
                    <div className="space-y-4">
                        <TwoFactorManager initialEnabled={Boolean(user.twoFactorEnabled)} />
                        {user.hasPassword && <ChangePasswordManager />}
                        <SessionsManager initialSessions={sessions} />
                    </div>
                </div>

                <div className="mt-12 border-t border-border pt-8">
                    <LogoutButton />
                </div>
            </div>
        </main>
    );
}
