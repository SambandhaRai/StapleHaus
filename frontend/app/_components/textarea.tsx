"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = "", id, ...props }, ref) => {
        const textareaId = id || props.name;
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="label-caps mb-2 block text-neutral-700">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={`w-full resize-y border bg-paper px-3.5 py-2.5 text-sm outline-none transition placeholder:text-subtle focus:border-ink ${error ? "border-danger" : "border-border"} ${className}`}
                    {...props}
                />
                {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
