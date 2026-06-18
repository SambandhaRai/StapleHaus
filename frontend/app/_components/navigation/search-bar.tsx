"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const submit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/search?q=${encodeURIComponent(q)}`);
        setOpen(false);
        setQuery("");
    };

    if (!open) {
        return (
            <button
                type="button"
                aria-label="Search"
                onClick={() => setOpen(true)}
                className="flex items-center justify-center text-ink transition hover:opacity-70"
            >
                <Search size={20} strokeWidth={1.5} />
            </button>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="flex items-center gap-2 border-b border-ink pb-0.5"
        >
            <Search size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
            <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search products"
                autoComplete="off"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        setOpen(false);
                        setQuery("");
                    }
                }}
                className="body-sm w-36 bg-transparent text-ink placeholder:text-subtle focus:outline-none sm:w-48"
            />
            <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                    setOpen(false);
                    setQuery("");
                }}
                className="shrink-0 text-muted transition hover:text-ink"
            >
                <X size={16} strokeWidth={1.5} />
            </button>
        </form>
    );
}
