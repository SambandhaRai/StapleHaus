"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import {
    handleGetBrands,
    handleCreateBrand,
    handleUpdateBrand,
    handleDeleteBrand,
} from "@/lib/actions/brands-action";
import { Button } from "@/app/_components/button";
import { BrandFormModal } from "./brand-form-modal";
import type { BrandRecord } from "./brand-types";
import { emptyBrandForm } from "./brand-types";
import { BrandsTable } from "./brands-table";

const fetchBrands = () => handleGetBrands();

export function BrandsManager() {
    const [brands, setBrands] = useState<BrandRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<BrandRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ ...emptyBrandForm });

    const load = async () => {
        setLoading(true);
        const res = await fetchBrands();
        if (res.success) setBrands(res.data || []);
        else toast.error(res.message || "Failed to load brands");
        setLoading(false);
    };

    useEffect(() => {
        let isCurrent = true;

        const loadInitialData = async () => {
            const res = await fetchBrands();
            if (!isCurrent) return;

            if (res.success) setBrands(res.data || []);
            else toast.error(res.message || "Failed to load brands");

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isCurrent = false;
        };
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyBrandForm });
        setOpen(true);
    };

    const openEdit = (brand: BrandRecord) => {
        setEditing(brand);
        setForm({ name: brand.name || "", slug: brand.slug || "", logo: brand.logo || "" });
        setOpen(true);
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        const payload = {
            name: form.name,
            ...(form.slug ? { slug: form.slug } : {}),
            ...(form.logo ? { logo: form.logo } : {}),
        };
        const res = editing
            ? await handleUpdateBrand(editing._id, payload)
            : await handleCreateBrand(payload);
        setSaving(false);
        if (res.success) {
            toast.success(res.message || "Saved");
            setOpen(false);
            load();
        } else {
            toast.error(res.message || "Save failed");
        }
    };

    const remove = async (brand: BrandRecord) => {
        if (!window.confirm(`Delete "${brand.name}"?`)) return;
        const res = await handleDeleteBrand(brand._id);
        if (res.success) {
            toast.success("Brand deleted");
            load();
        } else {
            toast.error(res.message || "Delete failed");
        }
    };

    return (
        <div className="px-6 py-10 sm:px-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="eyebrow mb-2">Catalog</p>
                    <h1 className="h1">Brands</h1>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} /> New brand
                </Button>
            </div>

            {loading ? (
                <p className="body-sm text-muted">Loading…</p>
            ) : brands.length === 0 ? (
                <p className="body-sm text-muted">No brands yet.</p>
            ) : (
                <BrandsTable brands={brands} onEdit={openEdit} onDelete={remove} />
            )}

            <BrandFormModal
                open={open}
                editing={editing}
                saving={saving}
                form={form}
                onClose={() => setOpen(false)}
                onSubmit={submit}
                onFormChange={setForm}
            />
        </div>
    );
}
