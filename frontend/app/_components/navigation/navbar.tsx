import Link from "next/link";
import { getAuthToken, getUserData } from "@/lib/cookie";
import { handleGetCategories } from "@/lib/actions/categories-action";
import { MenuDrawer } from "./menu-drawer";
import { AccountMenu } from "./account-menu";
import { NavMenu } from "./nav-menu";
import { CartBadge } from "./cart-badge";
import { SearchBar } from "./search-bar";

interface CategoryRecord {
    _id: string;
    name?: string;
    slug?: string;
}

const extractCategories = (res: unknown): CategoryRecord[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: CategoryRecord[] };
        if (r.success && Array.isArray(r.data)) return r.data;
    }
    return [];
};

export async function Navbar() {
    const [authToken, user, categoriesRes] = await Promise.all([
        getAuthToken(),
        getUserData(),
        handleGetCategories(),
    ]);
    const activeUser = authToken ? user : null;

    const accountHref = activeUser
        ? activeUser.role === "admin"
            ? "/admin"
            : "/account"
        : "/login";

    const categories = extractCategories(categoriesRes);

    const categoryItems = (landing: string) => [
        { label: "All", href: `${landing}/shop` },
        ...categories.map((category) => ({
            label: category.name || "",
            href: `${landing}/categories/${category.slug}`,
        })),
    ];

    return (
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="relative flex items-center justify-between px-6 py-4 sm:px-8">
                <div className="relative z-10 flex items-center gap-5">
                    <MenuDrawer userName={activeUser?.name ?? null} accountHref={accountHref} />
                    <nav className="hidden items-center gap-7 md:flex">
                        <NavMenu
                            label="New"
                            href="/men/shop"
                            items={[]}
                        />
                        <NavMenu
                            label="Men"
                            href="/men"
                            heading="Shop Men"
                            items={categoryItems("/men")}
                        />
                        <NavMenu
                            label="Women"
                            href="/women"
                            heading="Shop Women"
                            items={categoryItems("/women")}
                        />
                    </nav>
                </div>

                <Link
                    href="/"
                    className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    STAPLEHAUS
                </Link>

                <div className="relative z-10 flex items-center gap-5">
                    <SearchBar />
                    <AccountMenu userName={activeUser?.name ?? null} accountHref={accountHref} />
                    <CartBadge />
                </div>
            </div>
        </header>
    );
}
