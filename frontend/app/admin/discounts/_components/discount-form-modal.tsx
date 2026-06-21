import type { SyntheticEvent } from "react";
import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { Select } from "@/app/_components/select";
import { AdminModal } from "@/app/admin/_components/admin-modal";
import type { DiscountFormState, DiscountRecord } from "./discount-types";

interface DiscountFormModalProps {
    open: boolean;
    editing: DiscountRecord | null;
    saving: boolean;
    form: DiscountFormState;
    onClose: () => void;
    onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
    onFormChange: (form: DiscountFormState) => void;
}

export function DiscountFormModal({
    open,
    editing,
    saving,
    form,
    onClose,
    onSubmit,
    onFormChange,
}: DiscountFormModalProps) {
    return (
        <AdminModal
            open={open}
            title={editing ? "Edit discount" : "New discount"}
            onClose={onClose}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Input
                    label="Code"
                    value={form.code}
                    onChange={(event) => onFormChange({ ...form, code: event.target.value })}
                    placeholder="SAVE10"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Type"
                        value={form.type}
                        onChange={(event) => onFormChange({ ...form, type: event.target.value })}
                    >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (NRs.)</option>
                    </Select>
                    <Input
                        label="Value"
                        type="number"
                        step="any"
                        value={form.value}
                        onChange={(event) => onFormChange({ ...form, value: event.target.value })}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Min subtotal (optional)"
                        type="number"
                        step="any"
                        value={form.minSubtotal}
                        onChange={(event) =>
                            onFormChange({ ...form, minSubtotal: event.target.value })
                        }
                    />
                    <Input
                        label="Usage limit (optional)"
                        type="number"
                        value={form.usageLimit}
                        onChange={(event) =>
                            onFormChange({ ...form, usageLimit: event.target.value })
                        }
                    />
                </div>
                <Input
                    label="Expires at (optional)"
                    type="date"
                    value={form.expiresAt}
                    onChange={(event) => onFormChange({ ...form, expiresAt: event.target.value })}
                />
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) =>
                            onFormChange({ ...form, isActive: event.target.checked })
                        }
                    />
                    Active
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
