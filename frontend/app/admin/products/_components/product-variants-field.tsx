import { Plus, X } from "lucide-react";
import type { VariantRow } from "./product-admin-types";

interface ProductVariantsFieldProps {
    variants: VariantRow[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof VariantRow, value: string) => void;
}

export function ProductVariantsField({ variants, onAdd, onRemove, onChange }: ProductVariantsFieldProps) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="label-caps text-neutral-500">Variants</span>
                <button
                    type="button"
                    onClick={onAdd}
                    className="label-caps inline-flex items-center gap-1 text-neutral-500 transition hover:text-ink"
                >
                    <Plus size={14} /> Add variant
                </button>
            </div>
            <div className="space-y-3">
                {variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            placeholder="Size"
                            value={variant.size}
                            onChange={(event) => onChange(index, "size", event.target.value)}
                            className="w-full border border-border bg-paper px-2 py-2 text-sm outline-none focus:border-ink"
                        />
                        <input
                            placeholder="Stock"
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(event) => onChange(index, "stock", event.target.value)}
                            className="w-28 border border-border bg-paper px-2 py-2 text-sm outline-none focus:border-ink"
                        />
                        <button
                            type="button"
                            aria-label="Remove variant"
                            onClick={() => onRemove(index)}
                            className="shrink-0 p-1.5 text-neutral-400 transition hover:text-danger"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
