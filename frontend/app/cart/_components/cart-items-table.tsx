"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { handleRemoveCartItem, handleUpdateCartItem } from "@/lib/actions/cart-action";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "./cart-types";
import { CartRemoveConfirmation } from "./cart-remove-confirmation";
import {
    getLineTotal,
    getProduct,
    getProductHref,
    getProductImage,
    getUnitPrice,
    getVariant,
    money,
} from "./cart-utils";

interface CartItemsTableProps {
    items: CartItem[];
    updatingId: string | null;
    onUpdatingIdChange: (id: string | null) => void;
    onItemsChange: (items: CartItem[]) => void;
}

export function CartItemsTable({
    items,
    updatingId,
    onUpdatingIdChange,
    onItemsChange,
}: CartItemsTableProps) {
    const { refresh } = useCart();
    const [pendingRemoval, setPendingRemoval] = useState<CartItem | null>(null);

    const updateQuantity = async (item: CartItem, nextQuantity: number) => {
        if (nextQuantity < 1) return;
        onUpdatingIdChange(item._id);
        const result = await handleUpdateCartItem(item._id, nextQuantity);
        onUpdatingIdChange(null);

        if (result.success) {
            onItemsChange(result.data?.items || []);
            await refresh();
        } else {
            toast.error(result.message || "Failed to update quantity");
        }
    };

    const removeItem = async (item: CartItem) => {
        onUpdatingIdChange(item._id);
        const result = await handleRemoveCartItem(item._id);
        onUpdatingIdChange(null);

        if (result.success) {
            onItemsChange(result.data?.items || []);
            await refresh();
            toast.success("Item removed");
        } else {
            toast.error(result.message || "Failed to remove item");
        }
    };

    const confirmRemoval = (item: CartItem) => {
        setPendingRemoval(null);
        removeItem(item);
    };

    return (
        <div>
            <div className="hidden border-b border-border pb-4 text-sm font-semibold md:grid md:grid-cols-[minmax(360px,1fr)_120px_150px_120px] md:gap-8">
                <span>Product</span>
                <span className="text-right">Price</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-border">
                {items.map((item) => {
                    const product = getProduct(item);
                    const variant = getVariant(product, item.variantSku);
                    const image = getProductImage(item);
                    const quantity = item.quantity || 1;
                    const disabled = updatingId === item._id;

                    return (
                        <div
                            key={item._id}
                            className="grid gap-5 py-6 md:grid-cols-[minmax(360px,1fr)_120px_150px_120px] md:items-start md:gap-8"
                        >
                            <div className="flex gap-4">
                                <Link
                                    href={getProductHref(product)}
                                    className="relative h-32 w-24 shrink-0 overflow-hidden bg-neutral-100"
                                >
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt={product?.name || "Product image"}
                                            fill
                                            sizes="96px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="eyebrow flex h-full items-center justify-center text-subtle">
                                            StapleHaus
                                        </span>
                                    )}
                                </Link>

                                <div className="min-w-0 max-w-md">
                                    <Link
                                        href={getProductHref(product)}
                                        className="block text-sm font-semibold leading-snug hover:underline"
                                    >
                                        {product?.name || "Product"}
                                    </Link>
                                    <p className="body-sm mt-1 text-success">14 days returns.</p>
                                    <div className="body-sm mt-3 space-y-1 text-muted">
                                        {variant?.size ? <p>Size: {variant.size}</p> : null}
                                        <p className="max-w-xs truncate" title={item.variantSku}>
                                            SKU: {item.variantSku}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item)}
                                        disabled={disabled}
                                        className="body-sm mt-3 text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:block md:text-right">
                                <span className="body-sm text-muted md:hidden">Price</span>
                                <span className="numeric">{money(getUnitPrice(item))}</span>
                            </div>

                            <div className="flex items-center justify-between md:justify-center">
                                <span className="body-sm text-muted md:hidden">Qty</span>
                                <div className="flex h-11 w-32 items-center justify-between border border-border">
                                    <button
                                        type="button"
                                        aria-label={quantity <= 1 ? "Remove item" : "Decrease quantity"}
                                        disabled={disabled}
                                        onClick={() =>
                                            quantity <= 1
                                                ? setPendingRemoval(item)
                                                : updateQuantity(item, quantity - 1)
                                        }
                                        className="flex h-full w-10 items-center justify-center transition hover:bg-neutral-50 disabled:opacity-40"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="numeric font-semibold">{quantity}</span>
                                    <button
                                        type="button"
                                        aria-label="Increase quantity"
                                        disabled={disabled}
                                        onClick={() => updateQuantity(item, quantity + 1)}
                                        className="flex h-full w-10 items-center justify-center transition hover:bg-neutral-50 disabled:opacity-40"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between font-semibold md:block md:pl-4 md:text-right">
                                <span className="body-sm font-normal text-muted md:hidden">Total</span>
                                <span className="numeric">{money(getLineTotal(item))}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <CartRemoveConfirmation
                item={pendingRemoval}
                onCancel={() => setPendingRemoval(null)}
                onConfirm={confirmRemoval}
            />
        </div>
    );
}
