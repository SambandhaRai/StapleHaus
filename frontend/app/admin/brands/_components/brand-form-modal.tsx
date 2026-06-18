import type { SyntheticEvent } from "react";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { AdminModal } from "@/app/admin/_components/admin-modal";
import type { BrandFormState, BrandRecord } from "./brand-types";

interface BrandFormModalProps {
    open: boolean;
    editing: BrandRecord | null;
    saving: boolean;
    form: BrandFormState;
    onClose: () => void;
    onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
    onFormChange: (form: BrandFormState) => void;
}

export function BrandFormModal({
    open,
    editing,
    saving,
    form,
    onClose,
    onSubmit,
    onFormChange,
}: BrandFormModalProps) {
    return (
        <AdminModal open={open} title={editing ? "Edit brand" : "New brand"} onClose={onClose}>
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
                <Input
                    label="Logo URL (optional)"
                    value={form.logo}
                    onChange={(event) => onFormChange({ ...form, logo: event.target.value })}
                />
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
