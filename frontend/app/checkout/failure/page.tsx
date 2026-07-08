import Link from "next/link";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";

export default function CheckoutFailurePage() {
    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />
            <main className="mx-auto w-full max-w-xl px-6 py-20 text-center">
                <p className="eyebrow mb-3">Checkout</p>
                <h1 className="h1 mb-4">Payment Cancelled</h1>
                <p className="lede mx-auto mb-8 max-w-md">
                    Your payment was cancelled or did not go through. Your items are still in your cart — you can try again anytime.
                </p>
                <Link
                    href="/cart"
                    className="label-caps inline-flex bg-ink px-8 py-4 text-paper transition hover:opacity-80"
                >
                    Back To Cart
                </Link>
            </main>
            <Footer />
        </div>
    );
}
