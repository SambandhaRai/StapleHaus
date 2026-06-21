"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/app/_components/cart-provider";

export function CartBadge() {
    const { count } = useCart();

    return (
        <Link
            href="/cart"
            aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            className="relative flex items-center justify-center text-ink transition hover:opacity-70"
        >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 ? (
                <span className="numeric absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.625rem] font-medium leading-none text-paper">
                    {count > 99 ? "99+" : count}
                </span>
            ) : null}
        </Link>
    );
}
