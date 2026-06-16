"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-ink text-paper hover:opacity-80",
    secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
    ghost: "text-ink hover:bg-neutral-100",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-[0.7rem]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            fullWidth = false,
            isLoading = false,
            disabled,
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`label-caps inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
                {...props}
            >
                {isLoading && <Spinner size={14} />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
