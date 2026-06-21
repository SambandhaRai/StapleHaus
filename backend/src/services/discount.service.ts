import { DiscountRepository } from "../repositories/discount.repository";
import { CreateDiscountDto, UpdateDiscountDto, ValidateDiscountDto } from "../dtos/discount.dto";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

let discountRepository = new DiscountRepository();

export type AppliedDiscount = {
    discountId: string;
    code: string;
    type: string;
    value: number;
    amount: number;
};

export class DiscountService {

    async validateDiscount(data: ValidateDiscountDto): Promise<AppliedDiscount> {
        const discount = await discountRepository.getDiscountByCode(data.code);
        if (!discount) {
            throw new HttpError(404, "Discount code not found");
        }
        if (!discount.isActive) {
            throw new HttpError(400, "This discount code is no longer active");
        }
        if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
            throw new HttpError(400, "This discount code has expired");
        }
        if (discount.usageLimit !== undefined && discount.usedCount >= discount.usageLimit) {
            throw new HttpError(400, "This discount code has reached its usage limit");
        }
        if (discount.minSubtotal !== undefined && data.subtotal < discount.minSubtotal) {
            throw new HttpError(400, `A minimum subtotal of ${discount.minSubtotal} is required for this code`);
        }

        let amount = discount.type === "percent"
            ? (data.subtotal * discount.value) / 100
            : discount.value;

        amount = Math.min(amount, data.subtotal);
        amount = Math.round(amount * 100) / 100;

        return {
            discountId: discount._id.toString(),
            code: discount.code,
            type: discount.type,
            value: discount.value,
            amount,
        };
    }

    async redeemDiscount(discountId: string) {
        await discountRepository.incrementUsage(discountId);
    }

    async createDiscount(data: CreateDiscountDto) {
        const code = data.code.toUpperCase();
        const existing = await discountRepository.getDiscountByCode(code);
        if (existing) {
            throw new HttpError(409, "A discount with this code already exists");
        }

        return await discountRepository.createDiscount({
            code,
            type: data.type,
            value: data.value,
            minSubtotal: data.minSubtotal,
            expiresAt: data.expiresAt,
            usageLimit: data.usageLimit,
            isActive: data.isActive,
        });
    }

    async getAllDiscounts() {
        return await discountRepository.getAllDiscounts();
    }

    async updateDiscount(id: string, data: UpdateDiscountDto) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid discount ID");
        }

        const updateData: UpdateDiscountDto = { ...data };
        if (data.code !== undefined) {
            const code = data.code.toUpperCase();
            const existing = await discountRepository.getDiscountByCode(code);
            if (existing && existing._id.toString() !== id) {
                throw new HttpError(409, "A discount with this code already exists");
            }
            updateData.code = code;
        }

        const updated = await discountRepository.updateOneDiscount(id, updateData);
        if (!updated) {
            throw new HttpError(404, "Discount not found");
        }
        return updated;
    }

    async deleteDiscount(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid discount ID");
        }
        const deleted = await discountRepository.deleteOneDiscount(id);
        if (!deleted) {
            throw new HttpError(404, "Discount not found");
        }
        return deleted;
    }
}
