"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { handleValidateDiscount } from "@/lib/actions/discounts-action";
import type { AppliedDiscount, CheckoutCartItem } from "./checkout-types";
import { getItemCount, money } from "./checkout-utils";

interface CheckoutSummaryProps {
    items: CheckoutCartItem[];
    subtotal: number;
    discount: AppliedDiscount | null;
    onDiscountChange: (discount: AppliedDiscount | null) => void;
}

export function CheckoutSummary({
    items,
    subtotal,
    discount,
    onDiscountChange,
}: CheckoutSummaryProps) {
    const [code, setCode] = useState("");
    const [applying, setApplying] = useState(false);
    const discountAmount = Math.min(discount?.amount || 0, subtotal);
    const total = Math.max(0, subtotal - discountAmount);

    const applyDiscount = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextCode = code.trim();
        if (!nextCode) {
            toast.error("Enter a discount code");
            return;
        }

        setApplying(true);
        const result = await handleValidateDiscount({ code: nextCode, subtotal });
        setApplying(false);

        if (result.success && result.data?.amount) {
            onDiscountChange({
                code: result.data.code || nextCode.toUpperCase(),
                amount: Number(result.data.amount),
            });
            toast.success("Discount applied");
            return;
        }

        toast.error(result.message || "Invalid discount code");
    };

    return (
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border p-6">
                <h2 className="h2 mb-4">Order Summary</h2>
                <p className="body-sm mb-6 text-success">
                    Earn {Math.max(0, Math.floor(total / 10))} Staple points with your order
                </p>

                <div className="border-t border-border pt-5">
                    <p className="mb-5 font-semibold">Order Details</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <span>Items</span>
                            <span className="numeric">{getItemCount(items)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Subtotal</span>
                            <span className="numeric">{money(subtotal)}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span>Discounts</span>
                                {discount ? (
                                    <p className="body-sm mt-1 text-muted">{discount.code}</p>
                                ) : null}
                            </div>
                            <span className="numeric">
                                {discountAmount > 0 ? `-${money(discountAmount)}` : money(0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-2 text-lg font-semibold">
                            <span>Order Total</span>
                            <span className="numeric">{money(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border border-border p-6">
                <form onSubmit={applyDiscount}>
                    <label className="label-caps mb-3 block text-ink">Enter Discount Code</label>
                    <div className="flex gap-2">
                        <input
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="Discount Code"
                            className="min-w-0 flex-1 border border-border bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-subtle focus:border-ink"
                        />
                        <button
                            type="submit"
                            disabled={applying || subtotal <= 0}
                            className="label-caps shrink-0 bg-neutral-100 px-5 text-ink transition hover:bg-ink hover:text-paper disabled:opacity-50"
                        >
                            {applying ? "Applying" : "Apply"}
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

            <p className="body-sm text-muted">
                Returns and delivery details are confirmed after your order is placed.
            </p>
        </aside>
    );
}
