import Link from "next/link";
import { handleGetProducts } from "@/lib/actions/products-action";
import { handleGetBrands } from "@/lib/actions/brands-action";
import { handleGetCategories } from "@/lib/actions/categories-action";
import { handleGetAllOrders } from "@/lib/actions/orders-action";
import { handleGetAllDiscounts } from "@/lib/actions/discounts-action";
import { formatPrice } from "@/lib/format";

type ListResult = {
    data?: unknown[];
    total?: number;
};

type RevenueOrder = {
    total?: number;
};

const len = (res: ListResult) => (Array.isArray(res.data) ? res.data.length : 0);

export default async function AdminDashboard() {
    const [products, brands, categories, orders, discounts] = await Promise.all([
        handleGetProducts(),
        handleGetBrands(),
        handleGetCategories(),
        handleGetAllOrders(),
        handleGetAllDiscounts(),
    ]);

    const orderList: RevenueOrder[] = Array.isArray(orders.data) ? orders.data : [];
    const revenue = orderList.reduce((sum, order) => sum + (order.total || 0), 0);

    const stats = [
        { label: "Products", value: products?.total ?? len(products), href: "/admin/products" },
        { label: "Orders", value: len(orders), href: "/admin/orders" },
        { label: "Brands", value: len(brands), href: "/admin/brands" },
        { label: "Categories", value: len(categories), href: "/admin/categories" },
        { label: "Discounts", value: len(discounts), href: "/admin/discounts" },
    ];

    return (
        <div className="px-6 py-10 sm:px-10">
            <p className="eyebrow mb-2">Overview</p>
            <h1 className="h1 mb-10">Dashboard</h1>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((s) => (
                    <Link
                        key={s.label}
                        href={s.href}
                        className="border border-border p-6 transition hover:border-ink"
                    >
                        <p className="eyebrow mb-3 text-muted">{s.label}</p>
                        <p
                            className="numeric text-4xl font-semibold"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {s.value}
                        </p>
                    </Link>
                ))}

                <div className="border border-border bg-neutral-50 p-6">
                    <p className="eyebrow mb-3 text-muted">Revenue</p>
                    <p
                        className="numeric text-4xl font-semibold"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {formatPrice(revenue)}
                    </p>
                </div>
            </div>
        </div>
    );
}
