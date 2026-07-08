"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { label: "Dashboard", href: "/admin" },
    { label: "Products", href: "/admin/products" },
    { label: "Brands", href: "/admin/brands" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Discounts", href: "/admin/discounts" },
    { label: "Activity Logs", href: "/admin/activity-logs" },
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col">
            {links.map((link) => {
                const active =
                    link.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(link.href);
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`label-caps border-l-2 px-4 py-3 transition ${
                            active
                                ? "border-ink bg-neutral-100 text-ink"
                                : "border-transparent text-neutral-500 hover:text-ink"
                        }`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
