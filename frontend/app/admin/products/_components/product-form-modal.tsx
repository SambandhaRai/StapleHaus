import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { Select } from "@/app/_components/select";
import { Textarea } from "@/app/_components/textarea";
import { AdminModal } from "@/app/admin/_components/admin-modal";
import type {
    NewImageFile,
    ProductFormState,
    ProductOption,
    ProductRecord,
    VariantRow,
} from "./product-admin-types";
import { ProductImagesField } from "./product-images-field";
import { ProductVariantsField } from "./product-variants-field";

interface ProductFormModalProps {
    open: boolean;
    editing: ProductRecord | null;
    saving: boolean;
    form: ProductFormState;
    brands: ProductOption[];
    categories: ProductOption[];
    variants: VariantRow[];
    existingImages: string[];
    newFiles: NewImageFile[];
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onFormChange: (form: ProductFormState) => void;
    onSelectFiles: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemoveExistingImage: (image: string) => void;
    onRemoveNewImage: (index: number) => void;
    onAddVariant: () => void;
    onRemoveVariant: (index: number) => void;
    onVariantChange: (index: number, field: keyof VariantRow, value: string) => void;
}

export function ProductFormModal({
    open,
    editing,
    saving,
    form,
    brands,
    categories,
    variants,
    existingImages,
    newFiles,
    onClose,
    onSubmit,
    onFormChange,
    onSelectFiles,
    onRemoveExistingImage,
    onRemoveNewImage,
    onAddVariant,
    onRemoveVariant,
    onVariantChange,
}: ProductFormModalProps) {
    return (
        <AdminModal
            open={open}
            title={editing ? "Edit product" : "New product"}
            onClose={onClose}
            widthClass="max-w-2xl"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Input
                    label="Name"
                    value={form.name}
                    onChange={(event) => onFormChange({ ...form, name: event.target.value })}
                    required
                />
                <Input
                    label="Slug (optional)"
                    value={form.slug}
                    onChange={(event) => onFormChange({ ...form, slug: event.target.value })}
                    placeholder="auto-generated from name"
                />
                <Textarea
                    label="Description"
                    rows={3}
                    value={form.description}
                    onChange={(event) => onFormChange({ ...form, description: event.target.value })}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Brand"
                        value={form.brand}
                        onChange={(event) => onFormChange({ ...form, brand: event.target.value })}
                    >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                            <option key={brand._id} value={brand._id}>
                                {brand.name}
                            </option>
                        ))}
                    </Select>
                    <Select
                        label="Category"
                        value={form.category}
                        onChange={(event) => onFormChange({ ...form, category: event.target.value })}
                    >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Gender"
                        value={form.gender}
                        onChange={(event) => onFormChange({ ...form, gender: event.target.value })}
                    >
                        <option value="m">Men</option>
                        <option value="f">Women</option>
                        <option value="unisex">Unisex</option>
                    </Select>
                    <Input
                        label="Base price"
                        type="number"
                        step="any"
                        value={form.basePrice}
                        onChange={(event) => onFormChange({ ...form, basePrice: event.target.value })}
                        required
                    />
                </div>

                <ProductImagesField
                    existingImages={existingImages}
                    newFiles={newFiles}
                    onSelectFiles={onSelectFiles}
                    onRemoveExisting={onRemoveExistingImage}
                    onRemoveNew={onRemoveNewImage}
                />

                <ProductVariantsField
                    variants={variants}
                    onAdd={onAddVariant}
                    onRemove={onRemoveVariant}
                    onChange={onVariantChange}
                />

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => onFormChange({ ...form, isActive: event.target.checked })}
                    />
                    Active (visible in store)
                </label>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={saving}>
                        {editing ? "Save changes" : "Create"}
                    </Button>
                </div>
            </form>
        </AdminModal>
    );
}
