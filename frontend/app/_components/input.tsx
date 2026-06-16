"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", id, ...props }, ref) => {
        const inputId = id || props.name;
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="label-caps mb-2 block text-neutral-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`w-full border bg-paper px-3.5 py-2.5 text-sm outline-none transition placeholder:text-subtle focus:border-ink ${error ? "border-danger" : "border-border"} ${className}`}
                    {...props}
                />
                {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
