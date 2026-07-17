"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ProductCard } from "@/app/(shop)/_components/product-card";
import { useWishlist } from "@/context/WishlistContext";

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
    const { isWishlisted, remove } = useWishlist();
    const [removing, setRemoving] = useState<string | null>(null);

    const products = items.filter((product) => isWishlisted(product._id));

    const onRemove = async (productId: string) => {
        setRemoving(productId);
        await remove(productId);
        setRemoving(null);
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
                        onClick={() => onRemove(product._id)}
                        disabled={removing === product._id}
                        aria-label="Remove from wishlist"
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-border bg-paper/90 text-ink backdrop-blur transition hover:bg-ink hover:text-paper disabled:opacity-50"
                    >
                        <X size={15} strokeWidth={1.5} />
                    </button>
                    <ProductCard product={product} showWishlistButton={false} />
                </div>
            ))}
        </div>
    );
}
