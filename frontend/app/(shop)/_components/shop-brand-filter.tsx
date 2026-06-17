"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface BrandOption {
    _id: string;
    name?: string;
    slug?: string;
}

interface ShopBrandFilterProps {
    brands: BrandOption[];
    activeBrands: string[];
}

export function ShopBrandFilter({ brands, activeBrands }: ShopBrandFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");

    const selected = useMemo(
        () => brands.filter((brand) => brand.slug && activeBrands.includes(brand.slug)),
        [brands, activeBrands],
    );

    const options = useMemo(() => {
        const term = query.trim().toLowerCase();
        return brands
            .filter((brand) => brand.slug && !activeBrands.includes(brand.slug))
            .filter((brand) => (term ? brand.name?.toLowerCase().includes(term) : true));
    }, [brands, activeBrands, query]);

    const apply = (slugs: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slugs.length > 0) params.set("brand", slugs.join(","));
        else params.delete("brand");
        params.delete("page");
        const next = params.toString();
        router.push(next ? `${pathname}?${next}` : pathname);
    };

    const addBrand = (slug?: string) => {
        if (slug && !activeBrands.includes(slug)) {
            apply([...activeBrands, slug]);
            setQuery("");
        }
    };

    const removeBrand = (slug: string) => apply(activeBrands.filter((s) => s !== slug));

    return (
        <div>
            {selected.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                    {selected.map((brand) => (
                        <button
                            key={brand._id}
                            type="button"
                            onClick={() => removeBrand(brand.slug!)}
                            className="label-caps inline-flex items-center gap-2 border border-ink bg-ink px-3 py-1.5 text-paper transition hover:opacity-80"
                        >
                            {brand.name}
                            <X size={13} strokeWidth={2} />
                        </button>
                    ))}
                </div>
            ) : null}

            <div className="mb-3 flex items-center gap-2 border-b border-border pb-1.5 focus-within:border-ink">
                <Search size={15} strokeWidth={1.5} className="shrink-0 text-muted" />
                <input
                    type="text"
                    value={query}
                    placeholder="Search brands"
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                    className="body-sm w-full bg-transparent text-ink placeholder:text-subtle focus:outline-none"
                />
            </div>

            {options.length > 0 ? (
                <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {options.map((brand) => (
                        <li key={brand._id}>
                            <button
                                type="button"
                                onClick={() => addBrand(brand.slug)}
                                className="body-sm w-full py-1 text-left text-muted transition hover:text-ink"
                            >
                                {brand.name}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="body-sm text-muted">No brands found</p>
            )}
        </div>
    );
}
