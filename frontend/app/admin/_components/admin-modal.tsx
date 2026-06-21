"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    widthClass?: string;
}

export function AdminModal({ open, title, onClose, children, widthClass = "max-w-lg" }: AdminModalProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 py-10"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full border border-border bg-paper shadow-xl ${widthClass}`}
            >
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="h4">{title}</h2>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="text-ink transition hover:opacity-70"
                    >
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
                <div className="px-6 py-6">{children}</div>
            </div>
        </div>
    );
}
