"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const sortOptions = [
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
];

interface ShopSortProps {
    value: string;
}

export function ShopSort({ value }: ShopSortProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const current = sortOptions.some((option) => option.value === value) ? value : "";

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        if (event.target.value) {
            params.set("sort", event.target.value);
        } else {
            params.delete("sort");
        }
        params.delete("page");
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <label className="flex items-center gap-2">
            <span className="eyebrow hidden sm:inline">Sort</span>
            <select
                value={current}
                onChange={handleChange}
                className="label-caps cursor-pointer border-0 bg-transparent pr-1 text-ink focus:outline-none"
                aria-label="Sort products"
            >
                <option value="">Recommended</option>
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
