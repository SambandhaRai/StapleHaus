import type { CartItem } from "./cart-types";
import { getProduct } from "./cart-utils";

interface CartRemoveConfirmationProps {
    item: CartItem | null;
    onCancel: () => void;
    onConfirm: (item: CartItem) => void;
}

export function CartRemoveConfirmation({
    item,
    onCancel,
    onConfirm,
}: CartRemoveConfirmationProps) {
    if (!item) return null;

    const product = getProduct(item);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-cart-item-title"
                className="w-full max-w-sm border border-border bg-paper p-6 shadow-xl"
            >
                <h2 id="remove-cart-item-title" className="h4">
                    Remove item?
                </h2>
                <p className="body-sm mt-3 text-neutral-600">
                    {product?.name
                        ? `Remove ${product.name} from your shopping bag?`
                        : "Remove this item from your shopping bag?"}
                </p>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="label-caps border border-border px-4 py-2.5 text-ink transition hover:border-ink"
                    >
                        Keep Item
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(item)}
                        className="label-caps bg-ink px-4 py-2.5 text-paper transition hover:bg-neutral-800"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
