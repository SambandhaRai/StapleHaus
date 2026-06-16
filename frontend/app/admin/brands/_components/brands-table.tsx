import { Pencil, Trash2 } from "lucide-react";
import type { BrandRecord } from "./brand-types";

interface BrandsTableProps {
    brands: BrandRecord[];
    onEdit: (brand: BrandRecord) => void;
    onDelete: (brand: BrandRecord) => void;
}

export function BrandsTable({ brands, onEdit, onDelete }: BrandsTableProps) {
    return (
        <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
                <thead className="border-b border-border bg-neutral-50">
                    <tr>
                        <th className="label-caps px-4 py-3 text-left text-muted">Name</th>
                        <th className="label-caps px-4 py-3 text-left text-muted">Slug</th>
                        <th className="label-caps px-4 py-3 text-right text-muted">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {brands.map((brand) => (
                        <tr key={brand._id} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-3 font-medium">{brand.name}</td>
                            <td className="px-4 py-3 text-muted">{brand.slug}</td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(brand)}
                                        aria-label="Edit"
                                        className="p-1.5 text-neutral-500 transition hover:text-ink"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(brand)}
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
