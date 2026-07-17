"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { getUploadUrl } from "@/lib/uploads";
import { formatPrice as money } from "@/lib/format";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProduct {
    _id?: string;
    name: string;
    slug: string;
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
    images?: string[];
    basePrice: number;
}

interface ProductCardProps {
    product: ProductCardProduct;
    priority?: boolean;
    showWishlistButton?: boolean;
}

export function ProductCard({
    product,
    priority = false,
    showWishlistButton = true,
}: ProductCardProps) {
    const { isWishlisted, toggle } = useWishlist();
    const brandObj =
        product.brand && typeof product.brand === "object" ? product.brand : undefined;
    const brandName = brandObj?.name;
    const image = getUploadUrl(product.images?.[0]);
    const [wishing, setWishing] = useState(false);

    const wishlisted = Boolean(product._id && isWishlisted(product._id));

    const genderSegment = product.gender === "f" ? "women" : "men";
    const href = brandObj?.slug
        ? `/${genderSegment}/brands/${brandObj.slug}/${product.slug}`
        : `/${genderSegment}/brands/unknown/${product.slug}`;

    const handleWishlist = async () => {
        if (!product._id || wishing) return;

        setWishing(true);
        await toggle({ _id: product._id, name: product.name });
        setWishing(false);
    };

    return (
        <div className="group">
            <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-neutral-100">
                <Link href={href} className="relative block h-full">
                {image ? (
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        loading={priority ? "eager" : "lazy"}
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="eyebrow text-subtle">StapleHaus</span>
                    </div>
                )}
                </Link>
                {showWishlistButton && product._id ? (
                    <button
                        type="button"
                        onClick={handleWishlist}
                        disabled={wishing}
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-border bg-paper/90 text-ink backdrop-blur transition hover:bg-ink hover:text-paper disabled:opacity-50"
                    >
                        <Heart
                            size={15}
                            strokeWidth={1.6}
                            fill={wishlisted ? "currentColor" : "none"}
                        />
                    </button>
                ) : null}
            </div>

            {brandName && <p className="eyebrow mb-1">{brandName}</p>}
            <Link href={href} className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
                <span className="numeric body-sm whitespace-nowrap">{money(product.basePrice)}</span>
            </Link>
        </div>
    );
}
