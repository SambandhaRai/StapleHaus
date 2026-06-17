import Link from "next/link";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { getAuthToken } from "@/lib/cookie";
import { handleGetCart } from "@/lib/actions/cart-action";
import { CartView } from "./_components/cart-view";
import type { CartData } from "./_components/cart-types";

const extractCart = (res: unknown): CartData | null => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: CartData };
        if (result.success && result.data) return result.data;
    }
    return null;
};

export default async function CartPage() {
    const authToken = await getAuthToken();
    const cart = authToken ? extractCart(await handleGetCart()) : null;

    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />

            {authToken ? (
                <CartView initialCart={cart} />
            ) : (
                <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
                    <p className="eyebrow mb-3">Shopping Bag</p>
                    <h1 className="h1 mb-4">Sign in to view your bag</h1>
                    <p className="lede mx-auto mb-8 max-w-xl">
                        Your saved cart is connected to your account.
                    </p>
                    <Link
                        href="/login"
                        className="label-caps inline-flex bg-ink px-8 py-4 text-paper transition hover:opacity-80"
                    >
                        Login
                    </Link>
                </main>
            )}

            <Footer />
        </div>
    );
}
