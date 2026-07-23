import Link from "next/link";
import { Footer } from "@/app/_components/footer";
import { Navbar } from "@/app/_components/navigation/navbar";
import { handleGetCart } from "@/lib/actions/cart-action";
import { handleGetProfile } from "@/lib/actions/users-action";
import { getAuthToken } from "@/lib/cookie";
import { CheckoutForm } from "./_components/checkout-form";
import type { CheckoutCart, CheckoutUser } from "./_components/checkout-types";

const extractCart = (res: unknown): CheckoutCart | null => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: CheckoutCart };
        if (result.success && result.data) return result.data;
    }
    return null;
};

const extractUser = (res: unknown): CheckoutUser | null => {
    if (res && typeof res === "object" && "success" in res) {
        const result = res as { success?: boolean; data?: CheckoutUser };
        if (result.success && result.data) return result.data;
    }
    return null;
};

export default async function CheckoutPage() {
    const authToken = await getAuthToken();

    if (!authToken) {
        return (
            <CheckoutShell>
                <EmptyCheckoutState
                    eyebrow="Checkout"
                    title="Sign in to continue"
                    description="Your checkout is connected to your account and saved bag."
                    href="/login"
                    action="Login"
                />
            </CheckoutShell>
        );
    }

    const [profileRes, cartRes] = await Promise.all([
        handleGetProfile(),
        handleGetCart(),
    ]);
    const user = extractUser(profileRes);
    const cart = extractCart(cartRes);

    if (!user) {
        return (
            <CheckoutShell>
                <EmptyCheckoutState
                    eyebrow="Checkout"
                    title="Sign in to continue"
                    description="Your checkout is connected to your account and saved bag."
                    href="/login"
                    action="Login"
                />
            </CheckoutShell>
        );
    }

    if (!cart?.items?.length) {
        return (
            <CheckoutShell>
                <EmptyCheckoutState
                    eyebrow="Checkout"
                    title="Your bag is empty"
                    description="Add items to your bag before starting checkout."
                    href="/men/shop"
                    action="Continue Shopping"
                />
            </CheckoutShell>
        );
    }

    return (
        <CheckoutShell>
            <CheckoutForm user={user} cart={cart} />
        </CheckoutShell>
    );
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 flex-col bg-background text-foreground">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}

function EmptyCheckoutState({
    eyebrow,
    title,
    description,
    href,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    action: string;
}) {
    return (
        <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h1 className="h1 mb-4">{title}</h1>
            <p className="lede mx-auto mb-8 max-w-xl">{description}</p>
            <Link
                href={href}
                className="label-caps inline-flex bg-ink px-8 py-4 text-paper transition hover:opacity-80"
            >
                {action}
            </Link>
        </main>
    );
}
