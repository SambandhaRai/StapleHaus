"use client";

import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import {
    handleGetAllDiscounts,
    handleCreateDiscount,
    handleUpdateDiscount,
    handleDeleteDiscount,
} from "@/lib/actions/discounts-action";
import { Button } from "@/app/_components/button";
import { DiscountFormModal } from "./discount-form-modal";
import type { DiscountRecord } from "./discount-types";
import { emptyDiscountForm } from "./discount-types";
import { DiscountsTable } from "./discounts-table";

const fetchDiscounts = () => handleGetAllDiscounts();

export function DiscountsManager() {
    const [discounts, setDiscounts] = useState<DiscountRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<DiscountRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ ...emptyDiscountForm });

    const load = async () => {
        setLoading(true);
        const res = await fetchDiscounts();
        if (res.success) setDiscounts(res.data || []);
        else toast.error(res.message || "Failed to load discounts");
        setLoading(false);
    };

    useEffect(() => {
        let isCurrent = true;

        const loadInitialData = async () => {
            const res = await fetchDiscounts();
            if (!isCurrent) return;

            if (res.success) setDiscounts(res.data || []);
            else toast.error(res.message || "Failed to load discounts");

            setLoading(false);
        };

        loadInitialData();

        return () => {
            isCurrent = false;
        };
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyDiscountForm });
        setOpen(true);
    };

    const openEdit = (discount: DiscountRecord) => {
        setEditing(discount);
        setForm({
            code: discount.code || "",
            type: discount.type || "percent",
            value: String(discount.value ?? ""),
            minSubtotal: discount.minSubtotal != null ? String(discount.minSubtotal) : "",
            usageLimit: discount.usageLimit != null ? String(discount.usageLimit) : "",
            expiresAt: discount.expiresAt ? String(discount.expiresAt).slice(0, 10) : "",
            isActive: discount.isActive ?? true,
        });
        setOpen(true);
    };

    const submit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        event.preventDefault();
        setSaving(true);
        const payload = {
            code: form.code,
            type: form.type,
            value: Number(form.value),
            isActive: form.isActive,
            ...(form.minSubtotal ? { minSubtotal: Number(form.minSubtotal) } : {}),
            ...(form.usageLimit ? { usageLimit: Number(form.usageLimit) } : {}),
            ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
        };

        const res = editing
            ? await handleUpdateDiscount(editing._id, payload)
            : await handleCreateDiscount(payload);
        setSaving(false);
        if (res.success) {
            toast.success(res.message || "Saved");
            setOpen(false);
            load();
        } else {
            toast.error(res.message || "Save failed");
        }
    };

    const remove = async (discount: DiscountRecord) => {
        if (!window.confirm(`Delete code "${discount.code}"?`)) return;
        const res = await handleDeleteDiscount(discount._id);
        if (res.success) {
            toast.success("Discount deleted");
            load();
        } else {
            toast.error(res.message || "Delete failed");
        }
    };

    return (
        <div className="px-6 py-10 sm:px-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="eyebrow mb-2">Marketing</p>
                    <h1 className="h1">Discounts</h1>
                </div>
                <Button onClick={openCreate}>
                    <Plus size={16} /> New discount
                </Button>
            </div>

            {loading ? (
                <p className="body-sm text-muted">Loading…</p>
            ) : discounts.length === 0 ? (
                <p className="body-sm text-muted">No discount codes yet.</p>
            ) : (
                <DiscountsTable discounts={discounts} onEdit={openEdit} onDelete={remove} />
            )}

            <DiscountFormModal
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
