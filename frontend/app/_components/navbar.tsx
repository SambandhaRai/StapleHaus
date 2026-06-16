import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { getUserData } from "@/lib/cookie";
import { MenuDrawer } from "./menu-drawer";
import { AccountMenu } from "./account-menu";

export async function Navbar() {
    const user = await getUserData();
    const accountHref = user
        ? user.role === "admin"
            ? "/admin"
            : "/account"
        : "/login";

    return (
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4 sm:px-8">
                <div className="flex items-center gap-5">
                    <MenuDrawer userName={user?.name ?? null} accountHref={accountHref} />
                    <nav className="hidden gap-7 md:flex">
                        <Link className="label-caps link-underline" href="#">New</Link>
                        <Link className="label-caps link-underline" href="#">Men</Link>
                        <Link className="label-caps link-underline" href="#">Women</Link>
                        <Link className="label-caps link-underline text-sale" href="#">Sale</Link>
                    </nav>
                </div>

                <Link
                    href="/"
                    className="text-xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    STAPLEHAUS
                </Link>

                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        aria-label="Search"
                        className="flex items-center justify-center text-ink transition hover:opacity-70"
                    >
                        <Search size={20} strokeWidth={1.5} />
                    </button>
                    <AccountMenu userName={user?.name ?? null} accountHref={accountHref} />
                    <Link
                        href="/cart"
                        aria-label="Cart"
                        className="flex items-center justify-center text-ink transition hover:opacity-70"
                    >
                        <ShoppingBag size={20} strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
