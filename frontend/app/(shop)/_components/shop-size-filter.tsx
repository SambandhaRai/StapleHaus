"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

interface ShopSizeFilterProps {
    activeSizes: string[];
}

export function ShopSizeFilter({ activeSizes }: ShopSizeFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const toggle = (size: string) => {
        const next = activeSizes.includes(size)
            ? activeSizes.filter((s) => s !== size)
            : [...activeSizes, size];

        const params = new URLSearchParams(searchParams.toString());
        if (next.length > 0) {
            params.set("size", next.join(","));
        } else {
            params.delete("size");
        }
        params.delete("page");
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <ul className="space-y-2">
                {SIZES.map((size) => {
                    const checked = activeSizes.includes(size);
                    return (
                        <li key={size}>
                            <button
                                type="button"
                                onClick={() => toggle(size)}
                                className="flex w-full items-center gap-2.5 text-left"
                            >
                                <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center border transition ${
                                        checked ? "border-ink bg-ink text-paper" : "border-neutral-300"
                                    }`}
                                >
                                    {checked ? <Check size={11} strokeWidth={3} /> : null}
                                </span>
                                <span className={`body-sm ${checked ? "text-ink" : "text-muted"}`}>{size}</span>
                            </button>
                        </li>
                    );
                })}
        </ul>
    );
}
