"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                className="flex w-full items-center justify-between py-1"
            >
                <span className="eyebrow">{title}</span>
                <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className={`text-ink transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <div className={open ? "mt-3" : "hidden"}>{children}</div>
        </div>
    );
}
