import { Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { ProductRecord } from "./product-admin-types";

interface ProductsTableProps {
    products: ProductRecord[];
    onEdit: (product: ProductRecord) => void;
    onDelete: (product: ProductRecord) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
    return (
        <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
                <thead className="border-b border-border bg-neutral-50">
                    <tr>
                        <th className="label-caps px-4 py-3 text-left text-muted">Name</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Brand</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Price</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Variants</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Active</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product._id} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-3 font-medium">{product.name}</td>
                            <td className="px-4 py-3 text-muted">
                                {product.brand && typeof product.brand === "object"
                                    ? product.brand.name
                                    : "—"}
                            </td>
                            <td className="numeric px-4 py-3 text-right">
                                {formatPrice(product.basePrice)}
                            </td>
                            <td className="numeric px-4 py-3 text-right text-muted">
                                {Array.isArray(product.variants) ? product.variants.length : 0}
                            </td>
                            <td className="px-4 py-3">
                                {product.isActive ? (
                                    <span className="text-success">Active</span>
                                ) : (
                                    <span className="text-muted">Hidden</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(product)}
                                        aria-label="Edit"
                                        className="p-1.5 text-neutral-500 transition hover:text-ink"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(product)}
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
