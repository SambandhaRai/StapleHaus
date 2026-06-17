"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { ProductCard } from "@/app/(shop)/_components/product-card";
import { handleRemoveFromWishlist } from "@/lib/actions/wishlist-action";

interface WishlistProduct {
    _id: string;
    name: string;
    slug: string;
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

interface WishlistGridProps {
    items: WishlistProduct[];
}

export function WishlistGrid({ items }: WishlistGridProps) {
    const [products, setProducts] = useState(items);
    const [removing, setRemoving] = useState<string | null>(null);

    const remove = async (productId: string) => {
        setRemoving(productId);
        const res = await handleRemoveFromWishlist(productId);
        setRemoving(null);
        if (res.success) {
            setProducts((current) => current.filter((p) => p._id !== productId));
            toast.success(res.message || "Removed from wishlist");
        } else {
            toast.error(res.message || "Failed to remove item");
        }
    };

    if (products.length === 0) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
                <p className="body-sm text-muted">Your wishlist is empty.</p>
                <Link
                    href="/men"
                    className="label-caps inline-flex border border-ink px-5 py-2.5 transition hover:bg-ink hover:text-paper"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <div key={product._id} className="group relative">
                    <button
                        type="button"
                        onClick={() => remove(product._id)}
                        disabled={removing === product._id}
                        aria-label="Remove from wishlist"
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-border bg-paper/90 text-ink backdrop-blur transition hover:bg-ink hover:text-paper disabled:opacity-50"
                    >
                        <X size={15} strokeWidth={1.5} />
                    </button>
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    );
}
