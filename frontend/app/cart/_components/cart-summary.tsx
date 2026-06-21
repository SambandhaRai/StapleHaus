import type { DiscountState } from "./cart-types";
import { money } from "./cart-utils";

interface CartSummaryProps {
    subtotal: number;
    discount: DiscountState | null;
}

export function CartSummary({ subtotal, discount }: CartSummaryProps) {
    const discountAmount = Math.min(discount?.amount || 0, subtotal);
    const total = Math.max(0, subtotal - discountAmount);

    return (
        <div className="border border-border p-6">
            <h2 className="h2 mb-4">Order Summary</h2>
            <p className="body-sm mb-6 text-success">
                Earn {Math.max(0, Math.floor(total / 10))} Staple points with your order
            </p>

            <div className="space-y-4 border-t border-border pt-6">
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
                    <span className="numeric text-right">
                        {discountAmount > 0 ? `-${money(discountAmount)}` : money(0)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2 text-lg font-semibold">
                    <span>Order Total</span>
                    <span className="numeric">{money(total)}</span>
                </div>
            </div>
        </div>
    );
}
