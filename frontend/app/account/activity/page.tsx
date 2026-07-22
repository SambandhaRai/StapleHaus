import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { getAuthToken } from "@/lib/cookie";
import { handleGetActivityLogs } from "@/lib/actions/users-action";
import { ActivityLogManager, type ActivityLog } from "../_components/activity-log-manager";

export const metadata: Metadata = {
    title: "Recent activity",
};

const ACTIVITY_PAGE_SIZE = 20;

export default async function AccountActivityPage() {
    const authToken = await getAuthToken();
    if (!authToken) redirect("/login");

    const result = await handleGetActivityLogs(1, ACTIVITY_PAGE_SIZE);
    const logs: ActivityLog[] = result.success && Array.isArray(result.data) ? result.data : [];
    const total = result.meta?.total ?? logs.length;

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <main className="mx-auto w-full max-w-4xl px-6 py-12">
                <nav className="eyebrow mb-6 flex items-center gap-2 text-muted">
                    <Link href="/account" className="transition hover:text-ink">Account</Link>
                    <span>/</span>
                    <span className="text-ink">Recent activity</span>
                </nav>

                <h1 className="h1 mb-10">Recent activity</h1>

                <ActivityLogManager
                    initialLogs={logs}
                    initialTotal={total}
                    pageSize={ACTIVITY_PAGE_SIZE}
                />
            </main>

            <Footer />
        </div>
    );
}
