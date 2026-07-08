"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { User } from "lucide-react";
import { handleLogout } from "@/lib/actions/auth-action";
import { useCart } from "@/app/_components/cart-provider";

interface AccountMenuProps {
    userName?: string | null;
    accountHref: string;
}

const accountLinks = [
    { href: "/orders", label: "Orders" },
    { href: "/account/addresses", label: "Address Book" },
    { href: "/wishlist", label: "Wishlist" },
];

export function AccountMenu({ userName, accountHref }: AccountMenuProps) {
    const router = useRouter();
    const { reset } = useCart();
    const [loggingOut, setLoggingOut] = useState(false);

    const onLogout = async () => {
        setLoggingOut(true);
        await handleLogout();
        reset();
        toast.success("Logged out");
        router.push("/");
        router.refresh();
    };

    return (
        <div className="group relative">
            <Link
                href={userName ? accountHref : "/login"}
                aria-label="Account"
                className="flex items-center justify-center text-ink transition hover:opacity-70"
            >
                <User size={20} strokeWidth={1.5} />
            </Link>

            <div className="invisible absolute -right-10 top-full z-50 pt-5 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="w-64 border border-border bg-paper p-5 shadow-lg">
                    {userName ? (
                        <div>
                            <p className="eyebrow mb-1 text-muted">Account</p>
                            <p className="mb-4 text-sm font-medium">{userName}</p>
                            <nav className="flex flex-col">
                                <Link href={accountHref} className="py-2 text-sm transition hover:text-muted">
                                    Profile
                                </Link>
                                {accountLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="py-2 text-sm transition hover:text-muted"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    disabled={loggingOut}
                                    className="py-2 text-left text-sm transition hover:text-muted disabled:opacity-50"
                                >
                                    {loggingOut ? "Logging out…" : "Logout"}
                                </button>
                            </nav>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="h4 mb-1">Account</h3>
                                <p className="text-xs leading-relaxed text-neutral-600">
                                    Sign in for faster checkout, order tracking, and your wishlist.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/login"
                                    className="label-caps inline-flex flex-1 items-center justify-center border border-ink px-4 py-2.5 text-[0.7rem] transition hover:bg-ink hover:text-paper"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="label-caps inline-flex flex-1 items-center justify-center bg-ink px-4 py-2.5 text-[0.7rem] text-paper transition hover:opacity-80"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
