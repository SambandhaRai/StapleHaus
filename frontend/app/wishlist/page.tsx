import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/app/_components/navigation/navbar";
import { Footer } from "@/app/_components/footer";
import { getAuthToken } from "@/lib/cookie";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import { WishlistGrid } from "./_components/wishlist-grid";

interface WishlistProduct {
    _id: string;
    name: string;
    slug: string;
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
    images?: string[];
    basePrice: number;
    avgRating?: number;
    reviewCount?: number;
}

const extractItems = (res: unknown): WishlistProduct[] => {
    if (res && typeof res === "object" && "success" in res) {
        const r = res as { success?: boolean; data?: { productIds?: WishlistProduct[] } };
        if (r.success && Array.isArray(r.data?.productIds)) return r.data.productIds;
    }
    return [];
};

export default async function WishlistPage() {
    const authToken = await getAuthToken();
    if (!authToken) redirect("/login");

    const wishlistRes = await handleGetWishlist();
    const items = extractItems(wishlistRes);

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            <div className="mx-auto w-full max-w-7xl px-6 pt-6">
                <nav className="eyebrow flex items-center gap-2 text-muted">
                    <Link href="/account" className="transition hover:text-ink">Account</Link>
                    <span>/</span>
                    <span className="text-ink">Wishlist</span>
                </nav>
            </div>

            <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-4">
                <h1 className="h1">Wishlist</h1>
                <p className="body-sm mt-2 text-muted">
                    {items.length} {items.length === 1 ? "item" : "items"} saved
                </p>
            </div>

            <div className="mx-auto w-full max-w-7xl px-6 pb-20">
                <WishlistGrid items={items} />
            </div>

            <Footer />
        </div>
    );
}
