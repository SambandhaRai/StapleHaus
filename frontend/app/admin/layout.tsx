import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/_components/logout-button";
import { AdminNav } from "./_components/admin-nav";
import { handleGetProfile } from "@/lib/actions/users-action";

const extractUser = (res: unknown): { name?: string; role?: string } | null => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: { name?: string; role?: string } };
        if (result.success && result.data) return result.data;
    }
    return null;
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = extractUser(await handleGetProfile());

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
            <aside className="flex shrink-0 flex-col border-b border-border lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
                <div className="border-b border-border px-6 py-5">
                    <Link
                        href="/admin"
                        className="text-xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        STAPLEHAUS
                    </Link>
                    <p className="eyebrow mt-1 text-muted">Admin</p>
                </div>

                <div className="flex-1 py-4">
                    <AdminNav />
                </div>

                <div className="space-y-3 border-t border-border px-6 py-5">
                    <p className="body-sm text-muted">{user.name}</p>
                    <Link href="/" className="label-caps link-underline block">
                        Back to store
                    </Link>
                    <LogoutButton />
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
