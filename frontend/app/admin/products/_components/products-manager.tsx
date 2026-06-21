"use client";

import type { ChangeEvent, SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    handleCreateProduct,
    handleDeleteProduct,
    handleGetProducts,
    handleUpdateProduct,
} from "@/lib/actions/products-action";
import { handleGetBrands } from "@/lib/actions/brands-action";
import { handleGetCategories } from "@/lib/actions/categories-action";
import type {
    NewImageFile,
    ProductFormState,
    ProductOption,
    ProductRecord,
    VariantRow,
} from "./product-admin-types";
import { emptyForm, emptyVariant } from "./product-admin-types";
import { ProductFormModal } from "./product-form-modal";
import { ProductsHeader } from "./products-header";
import { ProductsTable } from "./products-table";

const fetchAdminProductData = () =>
    Promise.all([handleGetProducts(), handleGetBrands(), handleGetCategories()]);

export function ProductsManager() {
    const [products, setProducts] = useState<ProductRecord[]>([]);
    const [brands, setBrands] = useState<ProductOption[]>([]);
    const [categories, setCategories] = useState<ProductOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<ProductRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ProductFormState>({ ...emptyForm });
    const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<NewImageFile[]>([]);

    const clearNewFiles = () => {
        setNewFiles((prev) => {
            prev.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
            return [];
        });
    };

    const load = async () => {
        setLoading(true);
        const [productsResult, brandsResult, categoriesResult] = await fetchAdminProductData();

        if (productsResult.success) setProducts(productsResult.data || []);
        else toast.error(productsResult.message || "Failed to load products");

        if (brandsResult.success) setBrands(brandsResult.data || []);
        if (categoriesResult.success) setCategories(categoriesResult.data || []);

        setLoading(false);
    };

    useEffect(() => {
        let isCurrent = true;

        const loadInitialData = async () => {
            const [productsResult, brandsResult, categoriesResult] = await fetchAdminProductData();
            if (!isCurrent) return;

            if (productsResult.success) setProducts(productsResult.data || []);
            else toast.error(productsResult.message || "Failed to load products");

            if (brandsResult.success) setBrands(brandsResult.data || []);
            if (categoriesResult.success) setCategories(categoriesResult.data || []);

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isCurrent = false;
        };
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setVariants([emptyVariant()]);
        setExistingImages([]);
        clearNewFiles();
        setOpen(true);
    };

    const openEdit = (product: ProductRecord) => {
        setEditing(product);
        setForm({
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            brand: product.brand && typeof product.brand === "object"
                ? product.brand._id || ""
                : product.brand || "",
            category: product.category && typeof product.category === "object"
                ? product.category._id || ""
                : product.category || "",
            gender: product.gender || "m",
            basePrice: String(product.basePrice ?? ""),
            isActive: product.isActive ?? true,
        });
        setVariants(
            Array.isArray(product.variants) && product.variants.length > 0
                ? product.variants.map((variant) => ({
                    size: variant.size || "",
                    stock: String(variant.stock ?? ""),
                }))
                : [emptyVariant()]
        );
        setExistingImages(Array.isArray(product.images) ? product.images : []);
        clearNewFiles();
        setOpen(true);
    };

    const closeModal = () => {
        clearNewFiles();
        setOpen(false);
    };

    const onSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const selected = Array.from(files).map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setNewFiles((prev) => [...prev, ...selected]);
        event.target.value = "";
    };

    const removeNewImage = (index: number) => {
        setNewFiles((prev) => {
            const target = prev[index];
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, idx) => idx !== index);
        });
    };

    const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
        setVariants((prev) =>
            prev.map((variant, idx) => (idx === index ? { ...variant, [field]: value } : variant))
        );
    };

    const submit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();

        if (!form.brand || !form.category) {
            toast.error("Please choose a brand and a category");
            return;
        }

        const filledVariants = variants.filter((variant) => Boolean(variant.size || variant.stock));
        if (filledVariants.some((variant) => !variant.size)) {
            toast.error("Each variant needs a size");
            return;
        }

        setSaving(true);
        const payload = {
            name: form.name,
            description: form.description,
            brand: form.brand,
            category: form.category,
            gender: form.gender,
            basePrice: Number(form.basePrice),
            images: existingImages,
            isActive: form.isActive,
            variants: filledVariants.map((variant) => ({
                size: variant.size,
                stock: Number(variant.stock) || 0,
            })),
            ...(form.slug ? { slug: form.slug } : {}),
        };

        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));
        newFiles.forEach(({ file }) => formData.append("images", file));

        const result = editing
            ? await handleUpdateProduct(editing._id, formData)
            : await handleCreateProduct(formData);

        setSaving(false);
        if (result.success) {
            toast.success(result.message || "Saved");
            clearNewFiles();
            setOpen(false);
            load();
        } else {
            toast.error(result.message || "Save failed");
        }
    };

    const remove = async (product: ProductRecord) => {
        if (!window.confirm(`Delete "${product.name}"?`)) return;
        const result = await handleDeleteProduct(product._id);
        if (result.success) {
            toast.success("Product deleted");
            load();
        } else {
            toast.error(result.message || "Delete failed");
        }
    };

    return (
        <div className="px-6 py-10 sm:px-10">
            <ProductsHeader onCreate={openCreate} />

            {loading ? (
                <p className="body-sm text-muted">Loading…</p>
            ) : products.length === 0 ? (
                <p className="body-sm text-muted">No products yet.</p>
            ) : (
                <ProductsTable products={products} onEdit={openEdit} onDelete={remove} />
            )}

            <ProductFormModal
                open={open}
                editing={editing}
                saving={saving}
                form={form}
                brands={brands}
                categories={categories}
                variants={variants}
                existingImages={existingImages}
                newFiles={newFiles}
                onClose={closeModal}
                onSubmit={submit}
                onFormChange={setForm}
                onSelectFiles={onSelectFiles}
                onRemoveExistingImage={(image) =>
                    setExistingImages((prev) => prev.filter((item) => item !== image))
                }
                onRemoveNewImage={removeNewImage}
                onAddVariant={() => setVariants((prev) => [...prev, emptyVariant()])}
                onRemoveVariant={(index) =>
                    setVariants((prev) =>
                        prev.length > 1 ? prev.filter((_, idx) => idx !== index) : [emptyVariant()]
                    )
                }
                onVariantChange={updateVariant}
            />
        </div>
    );
}
