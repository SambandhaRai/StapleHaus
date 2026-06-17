"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { handleValidateDiscount } from "@/lib/actions/discounts-action";
import type { DiscountState } from "./cart-types";

interface CartCodePanelProps {
    subtotal: number;
    discount: DiscountState | null;
    onDiscountChange: (discount: DiscountState | null) => void;
}

export function CartCodePanel({ subtotal, discount, onDiscountChange }: CartCodePanelProps) {
    const [promoCode, setPromoCode] = useState("");
    const [applyingPromo, setApplyingPromo] = useState(false);

    const applyPromo = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const code = promoCode.trim();
        if (!code) {
            toast.error("Enter a promo code");
            return;
        }

        setApplyingPromo(true);
        const result = await handleValidateDiscount({ code, subtotal });
        setApplyingPromo(false);

        if (result.success && result.data?.amount) {
            onDiscountChange({
                code: result.data.code || code.toUpperCase(),
                amount: Number(result.data.amount),
            });
            toast.success("Promo code applied");
            return;
        }

        toast.error(result.message || "Invalid promo code");
    };

    return (
        <div className="border border-border p-6">
            <form onSubmit={applyPromo}>
                <label className="label-caps mb-3 block text-ink">Enter Discount Code</label>
                <div className="flex gap-2">
                    <input
                        value={promoCode}
                        onChange={(event) => setPromoCode(event.target.value)}
                        placeholder="Discount Code"
                        className="min-w-0 flex-1 border border-border bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-subtle focus:border-ink"
                    />
                    <button
                        type="submit"
                        disabled={applyingPromo || subtotal <= 0}
                        className="label-caps shrink-0 bg-neutral-100 px-5 text-ink transition hover:bg-ink hover:text-paper disabled:opacity-50"
                    >
                        {applyingPromo ? "Applying" : "Apply"}
                    </button>
                </div>
                {discount ? (
                    <button
                        type="button"
                        onClick={() => onDiscountChange(null)}
                        className="body-sm mt-2 text-muted underline-offset-2 hover:underline"
                    >
                        Remove {discount.code}
                    </button>
                ) : null}
            </form>
        </div>
    );
}
