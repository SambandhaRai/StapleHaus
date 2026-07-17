"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { handleVerifyPayment } from "@/lib/actions/orders-action";
import { useCart } from "@/context/CartContext";

type VerifyState = "verifying" | "success" | "failed";

export function PaymentResult({ data }: { data: string | null }) {
    const { refresh } = useCart();
    const [state, setState] = useState<VerifyState>("verifying");
    const [message, setMessage] = useState("Confirming your payment with eSewa…");
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        if (!data) {
            setState("failed");
            setMessage("Missing payment details. If you were charged, contact support with your order.");
            return;
        }

        handleVerifyPayment(data).then((result) => {
            if (result.success) {
                setState("success");
                setMessage("Your payment was confirmed and your order is now being processed.");
                refresh();
            } else {
                setState("failed");
                setMessage(result.message || "We couldn't confirm your payment.");
            }
        });
    }, [data, refresh]);

    return (
        <main className="mx-auto w-full max-w-xl px-6 py-20 text-center">
            <p className="eyebrow mb-3">Checkout</p>
            <h1 className="h1 mb-4">
                {state === "verifying" && "Verifying Payment"}
                {state === "success" && "Payment Successful"}
                {state === "failed" && "Payment Not Confirmed"}
            </h1>
            <p className="lede mx-auto mb-8 max-w-md">{message}</p>
            {state !== "verifying" && (
                <div className="flex justify-center gap-4">
                    <Link
                        href="/account"
                        className="label-caps inline-flex bg-ink px-8 py-4 text-paper transition hover:opacity-80"
                    >
                        View Orders
                    </Link>
                    {state === "failed" && (
                        <Link
                            href="/cart"
                            className="label-caps inline-flex border border-ink px-8 py-4 transition hover:bg-neutral-100"
                        >
                            Back To Cart
                        </Link>
                    )}
                </div>
            )}
        </main>
    );
}
