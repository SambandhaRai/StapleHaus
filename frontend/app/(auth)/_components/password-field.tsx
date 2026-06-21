"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
    ({ label, error, className = "", id, ...props }, ref) => {
        const [visible, setVisible] = useState(false);
        const inputId = id || props.name;

        return (
            <div className="w-full">
                {label ? (
                    <label htmlFor={inputId} className="label-caps mb-2 block text-neutral-700">
                        {label}
                    </label>
                ) : null}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={visible ? "text" : "password"}
                        className={`w-full border bg-paper px-3.5 py-2.5 pr-11 text-sm outline-none transition placeholder:text-subtle focus:border-ink ${error ? "border-danger" : "border-border"} ${className}`}
                        {...props}
                    />
                    <button
                        type="button"
                        aria-label={visible ? "Hide password" : "Show password"}
                        onClick={() => setVisible((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
                    >
                        {visible ? <EyeOff size={17} strokeWidth={1.6} /> : <Eye size={17} strokeWidth={1.6} />}
                    </button>
                </div>
                {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
            </div>
        );
    }
);

PasswordField.displayName = "PasswordField";
