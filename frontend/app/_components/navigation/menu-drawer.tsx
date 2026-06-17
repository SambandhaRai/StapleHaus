"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "../logout-button";

interface MenuDrawerProps {
    userName?: string | null;
    accountHref: string;
}

const navLinks = [
    { label: "New Arrivals", href: "#" },
    { label: "Men", href: "#" },
    { label: "Women", href: "#" },
    { label: "Clothing", href: "#" },
    { label: "Footwear", href: "#" },
    { label: "Accessories", href: "#" },
];

export function MenuDrawer({ userName, accountHref }: MenuDrawerProps) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setMounted(true), 0);
        return () => window.clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const close = () => setOpen(false);

    return (
        <>
            <button
                type="button"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                className="flex items-center justify-center text-ink transition hover:opacity-70"
            >
                <Menu size={22} strokeWidth={1.5} />
            </button>

            {mounted &&
                createPortal(
                    <>
                        <div
                            onClick={close}
                            aria-hidden="true"
                            className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
                        />

                        <aside
                            role="dialog"
                            aria-modal="true"
                            aria-label="Menu"
                            className={`fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col bg-paper shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
                        >
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <Link
                                    href="/"
                                    onClick={close}
                                    className="text-lg font-bold tracking-tight"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    STAPLEHAUS
                                </Link>
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={close}
                                    className="text-ink transition hover:opacity-70"
                                >
                                    <X size={22} strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="border-b border-border px-6 py-6">
                                {userName ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="eyebrow mb-1 text-muted">Signed in as</p>
                                            <p className="text-sm font-medium">{userName}</p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Link
                                                href={accountHref}
                                                onClick={close}
                                                className="label-caps inline-flex w-full items-center justify-center bg-ink px-6 py-3 text-paper transition hover:opacity-80"
                                            >
                                                My Account
                                            </Link>
                                            <LogoutButton />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm leading-relaxed text-neutral-600">
                                            Sign in to track orders, save your wishlist, and check out faster.
                                        </p>
                                        <div className="flex gap-3">
                                            <Link
                                                href="/login"
                                                onClick={close}
                                                className="label-caps inline-flex flex-1 items-center justify-center border border-ink px-5 py-3 transition hover:bg-ink hover:text-paper"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={close}
                                                className="label-caps inline-flex flex-1 items-center justify-center bg-ink px-5 py-3 text-paper transition hover:opacity-80"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <nav className="flex-1 overflow-y-auto px-6 py-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={close}
                                        className="block border-b border-border/60 py-4 text-sm transition hover:text-muted"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    href="#"
                                    onClick={close}
                                    className="block py-4 text-sm text-sale transition hover:opacity-70"
                                >
                                    Sale
                                </Link>
                            </nav>
                        </aside>
                    </>,
                    document.body
                )}
        </>
    );
}
