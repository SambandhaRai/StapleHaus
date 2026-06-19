import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { handleGetMyOrders } from "@/lib/actions/orders-action";
import { getAuthToken } from "@/lib/cookie";
import { formatPrice as money } from "@/lib/format";

type OrderItem = {
    name?: string;
    quantity?: number;
};

type OrderRecord = {
    _id: string;
    items?: OrderItem[];
    total?: number;
    paymentStatus?: string;
    orderStatus?: string;
    createdAt?: string;
};

const extractOrders = (res: unknown): OrderRecord[] => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: OrderRecord[] };
        if (result.success && Array.isArray(result.data)) return result.data;
    }
    return [];
};

export default async function OrdersPage() {
    const authToken = await getAuthToken();
    if (!authToken) redirect("/login");

    const orders = extractOrders(await handleGetMyOrders());

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <main className="mx-auto w-full max-w-6xl px-6 py-12">
                <nav className="eyebrow mb-6 flex items-center gap-2 text-muted">
                    <Link href="/account" className="transition hover:text-ink">Account</Link>
                    <span>/</span>
                    <span className="text-ink">Orders</span>
                </nav>

                <h1 className="h1 mb-10">Orders</h1>

                {orders.length === 0 ? (
                    <div className="border border-border p-8">
                        <h2 className="h4 mb-2">No orders yet</h2>
                        <p className="body-sm mb-6 text-muted">
                            Your completed orders will appear here.
                        </p>
                        <Link
                            href="/men/shop"
                            className="label-caps inline-flex bg-ink px-6 py-3 text-paper transition hover:opacity-80"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-border border-y border-border">
                        {orders.map((order) => (
                            <article key={order._id} className="grid gap-4 py-6 md:grid-cols-[1fr_auto]">
                                <div>
                                    <p className="numeric mb-2 font-semibold">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </p>
                                    <p className="body-sm text-muted">
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "Date unavailable"}
                                    </p>
                                    <p className="body-sm mt-3 text-muted">
                                        {order.items?.map((item) => `${item.name} x ${item.quantity || 1}`).join(", ")}
                                    </p>
                                </div>
                                <div className="md:text-right">
                                    <p className="numeric text-lg font-semibold">{money(order.total || 0)}</p>
                                    <p className="body-sm mt-2 text-muted">
                                        {order.orderStatus || "pending"} · {order.paymentStatus || "pending"}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
