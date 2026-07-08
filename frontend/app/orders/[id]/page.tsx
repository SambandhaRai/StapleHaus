import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { BackButton } from "@/app/_components/back-button";
import { handleGetOrderById } from "@/lib/actions/orders-action";
import { getAuthToken } from "@/lib/cookie";
import { formatPrice as money, formatOrderStatus } from "@/lib/format";
import { getUploadUrl } from "@/lib/uploads";

type OrderItem = {
    _id?: string;
    name?: string;
    image?: string;
    size?: string;
    color?: string;
    unitPrice?: number;
    quantity?: number;
};

type ShippingAddress = {
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
};

type OrderDetail = {
    _id: string;
    items?: OrderItem[];
    shippingAddress?: ShippingAddress;
    subtotal?: number;
    discount?: { code?: string; amount?: number };
    total?: number;
    paymentMethod?: string;
    paymentRef?: string;
    paymentStatus?: string;
    orderStatus?: string;
    createdAt?: string;
};

const extractOrder = (res: unknown): OrderDetail | null => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: OrderDetail };
        if (result.success && result.data) return result.data;
    }
    return null;
};

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const authToken = await getAuthToken();
    if (!authToken) redirect("/login");

    const { id } = await params;
    const order = extractOrder(await handleGetOrderById(id));

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <main className="mx-auto w-full max-w-4xl px-6 py-12">
                <BackButton fallbackHref="/orders" label="Back to Orders" className="mb-6" />

                {!order ? (
                    <div className="border border-border p-8">
                        <h2 className="h4 mb-2">Order not found</h2>
                        <p className="body-sm mb-6 text-muted">
                            This order doesn&apos;t exist or you don&apos;t have access to it.
                        </p>
                        <Link
                            href="/orders"
                            className="label-caps inline-flex bg-ink px-6 py-3 text-paper transition hover:opacity-80"
                        >
                            Back To Orders
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="h1 mb-2">Order #{order._id.slice(-6).toUpperCase()}</h1>
                                <p className="body-sm text-muted">
                                    {order.createdAt
                                        ? new Date(order.createdAt).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Date unavailable"}
                                </p>
                            </div>
                            <span className="label-caps border border-border px-4 py-2">
                                {formatOrderStatus(order.paymentStatus, order.orderStatus)}
                            </span>
                        </div>

                        <section className="mb-10">
                            <h2 className="h4 mb-4">Items</h2>
                            <div className="divide-y divide-border border-y border-border">
                                {order.items?.map((item, index) => (
                                    <div key={item._id || index} className="flex gap-4 py-4">
                                        <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
                                            {item.image ? (
                                                <Image
                                                    src={getUploadUrl(item.image)}
                                                    alt={item.name || "Product"}
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="flex flex-1 justify-between">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="body-sm text-muted">
                                                    {[item.size, item.color].filter(Boolean).join(" · ")}
                                                </p>
                                                <p className="body-sm text-muted">Qty {item.quantity || 1}</p>
                                            </div>
                                            <p className="numeric">{money((item.unitPrice || 0) * (item.quantity || 1))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="grid gap-10 md:grid-cols-2">
                            <section>
                                <h2 className="h4 mb-4">Shipping Address</h2>
                                <div className="body-sm space-y-1 text-muted">
                                    <p className="font-medium text-ink">{order.shippingAddress?.label}</p>
                                    <p>{order.shippingAddress?.line1}</p>
                                    {order.shippingAddress?.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                                    <p>
                                        {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                    <p>{order.shippingAddress?.country}</p>
                                    {order.shippingAddress?.phone ? <p>{order.shippingAddress.phone}</p> : null}
                                </div>
                            </section>

                            <section>
                                <h2 className="h4 mb-4">Summary</h2>
                                <div className="body-sm space-y-2">
                                    <div className="flex justify-between text-muted">
                                        <span>Subtotal</span>
                                        <span className="numeric">{money(order.subtotal || 0)}</span>
                                    </div>
                                    {order.discount?.amount ? (
                                        <div className="flex justify-between text-muted">
                                            <span>Discount{order.discount.code ? ` (${order.discount.code})` : ""}</span>
                                            <span className="numeric">- {money(order.discount.amount)}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                                        <span>Total</span>
                                        <span className="numeric">{money(order.total || 0)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 text-muted">
                                        <span>Payment</span>
                                        <span className="uppercase">{order.paymentMethod || "esewa"}</span>
                                    </div>
                                    {order.paymentRef ? (
                                        <div className="flex justify-between text-muted">
                                            <span>Reference</span>
                                            <span className="numeric">{order.paymentRef}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
