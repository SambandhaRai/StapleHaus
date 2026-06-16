"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, className = "", id, children, ...props }, ref) => {
        const selectId = id || props.name;
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="label-caps mb-2 block text-neutral-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={`w-full appearance-none border bg-paper px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-ink ${error ? "border-danger" : "border-border"} ${className}`}
                        {...props}
                    >
                        {children}
                    </select>
                    <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                </div>
                {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
