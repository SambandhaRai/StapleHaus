"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";

interface CarouselProduct {
    _id?: string;
    name: string;
    slug: string;
    brand?: { name?: string } | string | null;
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

interface ProductCarouselProps {
    products: CarouselProduct[];
    priorityCount?: number;
}

export function ProductCarousel({
    products,
    priorityCount = 0,
}: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollByPage = (direction: 1 | -1) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
    };

    return (
        <div className="group/carousel relative">
            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
                {products.map((product, index) => (
                    <div
                        key={product.slug}
                        className="w-[44%] shrink-0 sm:w-[31%] md:w-[23.5%] lg:w-[19%]"
                    >
                        <ProductCard
                            product={product}
                            priority={index < priorityCount}
                        />
                    </div>
                ))}
            </div>

            <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByPage(-1)}
                className="absolute left-2 top-[33%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-paper/90 text-ink opacity-0 backdrop-blur transition hover:bg-ink hover:text-paper group-hover/carousel:opacity-100 md:flex"
            >
                <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByPage(1)}
                className="absolute right-2 top-[33%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-paper/90 text-ink opacity-0 backdrop-blur transition hover:bg-ink hover:text-paper group-hover/carousel:opacity-100 md:flex"
            >
                <ChevronRight size={18} strokeWidth={1.5} />
            </button>
        </div>
    );
}
