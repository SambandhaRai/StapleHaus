import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { getUploadUrl } from "@/lib/uploads";

interface ProductCardProduct {
    name: string;
    slug: string;
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

interface ProductCardProps {
    product: ProductCardProduct;
}

const money = (n: number) => `$${n.toFixed(2)}`;

export function ProductCard({ product }: ProductCardProps) {
    const brandObj =
        product.brand && typeof product.brand === "object" ? product.brand : undefined;
    const brandName = brandObj?.name;
    const image = getUploadUrl(product.images?.[0]);
    const roundedRating = Math.round(product.avgRating || 0);

    const genderSegment = product.gender === "f" ? "women" : "men";
    const href = brandObj?.slug
        ? `/${genderSegment}/brands/${brandObj.slug}/${product.slug}`
        : `/${genderSegment}/brands/unknown/${product.slug}`;

    return (
        <Link href={href} className="group block">
            <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-neutral-100">
                {image ? (
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="eyebrow text-subtle">StapleHaus</span>
                    </div>
                )}
                {product.reviewCount ? (
                    <div className="absolute left-3 top-3">
                        <span className="label-caps inline-flex items-center border border-ink bg-paper/80 px-2 py-1 text-[0.6rem] text-ink backdrop-blur">
                            {product.avgRating?.toFixed(1)} ★
                        </span>
                    </div>
                ) : null}
            </div>

            {brandName && <p className="eyebrow mb-1">{brandName}</p>}
            <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
                <span className="numeric body-sm whitespace-nowrap">{money(product.basePrice)}</span>
            </div>
            {product.reviewCount ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                className={i < roundedRating ? "text-ink" : "text-neutral-300"}
                                fill={i < roundedRating ? "currentColor" : "none"}
                            />
                        ))}
                    </div>
                    <span className="numeric text-xs text-muted">({product.reviewCount})</span>
                </div>
            ) : null}
        </Link>
    );
}
