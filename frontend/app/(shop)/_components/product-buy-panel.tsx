"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Heart, Check } from "lucide-react";
import { handleAddToCart } from "@/lib/actions/cart-action";
import { handleAddToWishlist, handleRemoveFromWishlist } from "@/lib/actions/wishlist-action";
import { useCart } from "@/app/_components/cart-provider";

interface Variant {
    _id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number;
}

interface ProductBuyPanelProps {
    productId: string;
    brandName?: string;
    name: string;
    basePrice: number;
    variants: Variant[];
    loggedIn: boolean;
    initialWishlisted: boolean;
    initialCartSkus: string[];
}

const money = (n: number) => `$${n.toFixed(2)}`;

export function ProductBuyPanel({
    productId,
    brandName,
    name,
    basePrice,
    variants,
    loggedIn,
    initialWishlisted,
    initialCartSkus,
}: ProductBuyPanelProps) {
    const router = useRouter();
    const { addToCount } = useCart();
    const [selectedSku, setSelectedSku] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [wishing, setWishing] = useState(false);
    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [cartSkus, setCartSkus] = useState<string[]>(initialCartSkus);

    const selectedVariant = variants.find((variant) => variant.sku === selectedSku);
    const displayPrice = selectedVariant?.priceOverride ?? basePrice;

    const inBag = selectedSku ? cartSkus.includes(selectedSku) : cartSkus.length > 0;

    const handleAdd = async () => {
        if (!loggedIn) {
            router.push("/login");
            return;
        }
        if (inBag) {
            router.push("/cart");
            return;
        }
        if (!selectedSku) {
            toast.error("Please select a size");
            return;
        }
        setAdding(true);
        const res = await handleAddToCart({ productId, variantSku: selectedSku, quantity: 1 });
        setAdding(false);
        if (res.success) {
            setCartSkus((current) => [...current, selectedSku]);
            addToCount(1);
            toast.success(res.message || "Added to bag");
        } else {
            toast.error(res.message || "Failed to add to bag");
        }
    };

    const handleWishlist = async () => {
        if (!loggedIn) {
            router.push("/login");
            return;
        }
        setWishing(true);
        const res = wishlisted
            ? await handleRemoveFromWishlist(productId)
            : await handleAddToWishlist(productId);
        setWishing(false);
        if (res.success) {
            setWishlisted((current) => !current);
            toast.success(res.message || (wishlisted ? "Removed from wishlist" : "Added to wishlist"));
        } else {
            toast.error(res.message || "Something went wrong");
        }
    };

    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                {brandName ? <p className="eyebrow">{brandName}</p> : <span />}
                <button
                    type="button"
                    onClick={handleWishlist}
                    disabled={wishing}
                    className="label-caps inline-flex items-center gap-1.5 text-muted transition hover:text-ink disabled:opacity-50"
                >
                    <Heart
                        size={15}
                        strokeWidth={1.5}
                        fill={wishlisted ? "currentColor" : "none"}
                    />
                    {wishlisted ? "In Wishlist" : "Add to Wishlist"}
                </button>
            </div>

            <h1 className="h2 mt-2">{name}</h1>
            <p className="numeric h4 mt-4">{money(displayPrice)}</p>

            <div className="mt-8">
                <p className="eyebrow mb-3">Size</p>
                {variants.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {variants.map((variant) => {
                            const soldOut = variant.stock <= 0;
                            const active = variant.sku === selectedSku;
                            return (
                                <button
                                    key={variant._id}
                                    type="button"
                                    disabled={soldOut}
                                    onClick={() => {
                                        setSelectedSku((current) =>
                                            current === variant.sku ? null : variant.sku,
                                        );
                                    }}
                                    className={`label-caps flex items-center justify-center border py-3 transition ${
                                        active
                                            ? "border-ink bg-ink text-paper"
                                            : "border-border text-ink hover:border-ink"
                                    } ${soldOut ? "cursor-not-allowed text-subtle line-through hover:border-border" : ""}`}
                                >
                                    {variant.size}
                                    {variant.color && variant.color !== "default" ? ` · ${variant.color}` : ""}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="body-sm text-muted">Currently unavailable.</p>
                )}
            </div>

            <button
                type="button"
                onClick={handleAdd}
                disabled={adding || variants.length === 0}
                className={`mt-6 flex w-full items-center justify-center gap-2 py-4 transition-colors duration-200 disabled:opacity-50 ${
                    inBag
                        ? "bg-success text-paper hover:bg-ink"
                        : "bg-accent text-accent-foreground hover:opacity-90"
                }`}
            >
                <span className="label-caps inline-flex items-center gap-2">
                    {inBag && !adding ? <Check size={15} strokeWidth={2} /> : null}
                    {adding ? "Adding…" : inBag ? "Proceed to Bag" : "Add To Bag"}
                </span>
            </button>
        </div>
    );
}
