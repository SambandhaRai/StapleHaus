"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartCodePanel } from "./cart-code-panel";
import { CartItemsTable } from "./cart-items-table";
import { CartSummary } from "./cart-summary";
import type { CartData, CartItem, DiscountState } from "./cart-types";
import { getCartQuantity, getCartSubtotal } from "./cart-utils";

interface CartViewProps {
    initialCart: CartData | null;
}

export function CartView({ initialCart }: CartViewProps) {
    const [items, setItems] = useState<CartItem[]>(initialCart?.items || []);
    const [discount, setDiscount] = useState<DiscountState | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const subtotal = useMemo(() => getCartSubtotal(items), [items]);
    const quantity = useMemo(() => getCartQuantity(items), [items]);

    const handleItemsChange = (nextItems: CartItem[]) => {
        setItems(nextItems);
        if (getCartSubtotal(nextItems) === 0) {
            setDiscount(null);
        }
    };

    if (items.length === 0) {
        return (
            <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
                <p className="eyebrow mb-3">Shopping Bag</p>
                <h1 className="h1 mb-4">Your bag is empty</h1>
                <p className="lede mx-auto mb-8 max-w-xl">
                    Add a few staples and they will show up here when you are ready to check out.
                </p>
                <Link
                    href="/men/shop"
                    className="label-caps inline-flex bg-ink px-8 py-4 text-paper transition hover:opacity-80"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <main className="mx-auto w-full max-w-8xl px-6 py-12 lg:px-10 lg:py-16">
            <h1 className="h1 mb-10 text-center">Shopping Bag</h1>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
                <section>
                    <CartItemsTable
                        items={items}
                        updatingId={updatingId}
                        onUpdatingIdChange={setUpdatingId}
                        onItemsChange={handleItemsChange}
                    />

                    <p className="body-sm mt-6 font-semibold">Cart ID: {initialCart?._id || "Pending"}</p>
                    <p className="body-sm mt-2 text-muted">
                        {quantity} {quantity === 1 ? "item" : "items"} in your bag.
                    </p>
                </section>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <CartSummary subtotal={subtotal} discount={discount} />
                    <CartCodePanel
                        subtotal={subtotal}
                        discount={discount}
                        onDiscountChange={setDiscount}
                    />
                    <Link
                        href="/checkout"
                        className="label-caps flex w-full items-center justify-center bg-ink px-8 py-4 text-paper transition hover:bg-neutral-800"
                    >
                        Checkout Now
                    </Link>
                </aside>
            </div>
        </main>
    );
}
