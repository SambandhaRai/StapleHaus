"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    className?: string;
    fallbackHref?: string;
    label?: string;
}

export function BackButton({ className = "", fallbackHref = "/", label = "Back" }: BackButtonProps) {
    const router = useRouter();

    const goBack = () => {
        if (window.history.length > 1) {
            router.back();
            return;
        }
        router.push(fallbackHref);
    };

    return (
        <button
            type="button"
            onClick={goBack}
            className={`label-caps inline-flex items-center gap-1.5 text-neutral-500 transition hover:text-ink ${className}`}
        >
            <ArrowLeft size={14} strokeWidth={1.5} />
            {label}
        </button>
    );
}
