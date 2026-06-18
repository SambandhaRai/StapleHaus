"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import {
    handleGetCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
} from "@/lib/actions/categories-action";
import { Button } from "@/app/_components/button";
import { CategoriesTable } from "./categories-table";
import { CategoryFormModal } from "./category-form-modal";
import type { CategoryRecord } from "./category-types";
import { emptyCategoryForm } from "./category-types";

const fetchCategories = () => handleGetCategories();

export function CategoriesManager() {
    const [categories, setCategories] = useState<CategoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<CategoryRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ ...emptyCategoryForm });

    const load = async () => {
        setLoading(true);
        const res = await fetchCategories();
        if (res.success) setCategories(res.data || []);
        else toast.error(res.message || "Failed to load categories");
        setLoading(false);
    };

    useEffect(() => {
        let isCurrent = true;

        const loadInitialData = async () => {
            const res = await fetchCategories();
            if (!isCurrent) return;

            if (res.success) setCategories(res.data || []);
            else toast.error(res.message || "Failed to load categories");

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isCurrent = false;
        };
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyCategoryForm });
        setOpen(true);
    };

    const openEdit = (category: CategoryRecord) => {
        setEditing(category);
        setForm({ name: category.name || "", slug: category.slug || "" });
        setOpen(true);
    };

    const submit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();
        setSaving(true);
        const payload = { name: form.name, ...(form.slug ? { slug: form.slug } : {}) };
        const res = editing
            ? await handleUpdateCategory(editing._id, payload)
            : await handleCreateCategory(payload);
        setSaving(false);
        if (res.success) {
            toast.success(res.message || "Saved");
            setOpen(false);
            load();
        } else {
            toast.error(res.message || "Save failed");
        }
    };

    const remove = async (category: CategoryRecord) => {
        if (!window.confirm(`Delete "${category.name}"?`)) return;
        const res = await handleDeleteCategory(category._id);
        if (res.success) {
            toast.success("Category deleted");
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
                    <h1 className="h1">Categories</h1>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} /> New category
                </Button>
            </div>

            {loading ? (
                <p className="body-sm text-muted">Loading…</p>
            ) : categories.length === 0 ? (
                <p className="body-sm text-muted">No categories yet.</p>
            ) : (
                <CategoriesTable categories={categories} onEdit={openEdit} onDelete={remove} />
            )}

            <CategoryFormModal
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
