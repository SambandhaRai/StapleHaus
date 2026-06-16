import { Pencil, Trash2 } from "lucide-react";
import type { DiscountRecord } from "./discount-types";

interface DiscountsTableProps {
    discounts: DiscountRecord[];
    onEdit: (discount: DiscountRecord) => void;
    onDelete: (discount: DiscountRecord) => void;
}

export function DiscountsTable({ discounts, onEdit, onDelete }: DiscountsTableProps) {
    return (
        <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
                <thead className="border-b border-border bg-neutral-50">
                    <tr>
                        <th className="label-caps px-4 py-3 text-left text-muted">Code</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Type</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Value</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Used</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Active</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {discounts.map((discount) => (
                        <tr key={discount._id} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-3 font-medium">{discount.code}</td>
                            <td className="px-4 py-3 text-muted">{discount.type}</td>
                            <td className="numeric px-4 py-3 text-right">
                                {discount.type === "percent"
                                    ? `${discount.value}%`
                                    : `$${discount.value}`}
                            </td>
                            <td className="numeric px-4 py-3 text-right text-muted">
                                {discount.usedCount ?? 0}
                                {discount.usageLimit ? ` / ${discount.usageLimit}` : ""}
                            </td>
                            <td className="px-4 py-3">
                                {discount.isActive ? (
                                    <span className="text-success">Active</span>
                                ) : (
                                    <span className="text-muted">Off</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(discount)}
                                        aria-label="Edit"
                                        className="p-1.5 text-neutral-500 transition hover:text-ink"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(discount)}
                                        aria-label="Delete"
                                        className="p-1.5 text-neutral-500 transition hover:text-danger"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
