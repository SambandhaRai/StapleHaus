"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface ShopPriceFilterProps {
    minBound: number;
    maxBound: number;
    initialMin: number;
    initialMax: number;
}

const money = (n: number) => `NRs. ${Math.round(n).toLocaleString("en-IN")}`;

export function ShopPriceFilter({ minBound, maxBound, initialMin, initialMax }: ShopPriceFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [lo, setLo] = useState(initialMin);
    const [hi, setHi] = useState(initialMax);

    const span = Math.max(1, maxBound - minBound);
    const step = Math.max(1, Math.round(span / 100));
    const leftPct = ((lo - minBound) / span) * 100;
    const rightPct = ((maxBound - hi) / span) * 100;

    const commit = (nextLo: number, nextHi: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (nextLo > minBound) params.set("minPrice", String(nextLo));
        else params.delete("minPrice");
        if (nextHi < maxBound) params.set("maxPrice", String(nextHi));
        else params.delete("maxPrice");
        params.delete("page");
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    if (maxBound <= minBound) return null;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <span className="numeric body-sm text-ink">{money(lo)}</span>
                <span className="numeric body-sm text-ink">{money(hi)}</span>
            </div>

            <div className="range-dual">
                <div className="range-track" />
                <div
                    className="range-fill"
                    style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                />
                <input
                    type="range"
                    className="range-thumb"
                    min={minBound}
                    max={maxBound}
                    step={step}
                    value={lo}
                    aria-label="Minimum price"
                    onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
                    onMouseUp={() => commit(lo, hi)}
                    onTouchEnd={() => commit(lo, hi)}
                    onKeyUp={() => commit(lo, hi)}
                />
                <input
                    type="range"
                    className="range-thumb"
                    min={minBound}
                    max={maxBound}
                    step={step}
                    value={hi}
                    aria-label="Maximum price"
                    onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
                    onMouseUp={() => commit(lo, hi)}
                    onTouchEnd={() => commit(lo, hi)}
                    onKeyUp={() => commit(lo, hi)}
                />
            </div>
        </div>
    );
}
