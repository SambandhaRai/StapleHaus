import { DiscountModel, IDiscount } from "../models/discount.model";
import { DiscountTypeType } from "../types/discount.type";

type CreateDiscountData = {
    code: string;
    type: DiscountTypeType;
    value: number;
    minSubtotal?: number;
    expiresAt?: Date;
    usageLimit?: number;
    isActive: boolean;
};

type UpdateDiscountData = Partial<CreateDiscountData>;

export interface IDiscountRepository {
    createDiscount(data: CreateDiscountData): Promise<IDiscount>;
    getAllDiscounts(): Promise<IDiscount[]>;
    getDiscountById(id: string): Promise<IDiscount | null>;
    getDiscountByCode(code: string): Promise<IDiscount | null>;
    updateOneDiscount(id: string, data: UpdateDiscountData): Promise<IDiscount | null>;
    deleteOneDiscount(id: string): Promise<boolean | null>;
    reserveUsage(id: string): Promise<IDiscount | null>;
    releaseUsage(id: string): Promise<IDiscount | null>;
}

export class DiscountRepository implements IDiscountRepository {

    async createDiscount(data: CreateDiscountData): Promise<IDiscount> {
        return await DiscountModel.create(data);
    }

    async getAllDiscounts(): Promise<IDiscount[]> {
        return await DiscountModel.find().sort({ createdAt: -1 });
    }

    async getDiscountById(id: string): Promise<IDiscount | null> {
        return await DiscountModel.findById(id);
    }

    async getDiscountByCode(code: string): Promise<IDiscount | null> {
        return await DiscountModel.findOne({ code: code.toUpperCase() });
    }

    async updateOneDiscount(id: string, data: UpdateDiscountData): Promise<IDiscount | null> {
        return await DiscountModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
    }

    async deleteOneDiscount(id: string): Promise<boolean | null> {
        const result = await DiscountModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async reserveUsage(id: string): Promise<IDiscount | null> {
        return await DiscountModel.findOneAndUpdate(
            {
                _id: id,
                isActive: true,
                $or: [
                    { usageLimit: { $exists: false } },
                    { usageLimit: null },
                    { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
                ],
            },
            { $inc: { usedCount: 1 } },
            { returnDocument: "after" }
        );
    }

    async releaseUsage(id: string): Promise<IDiscount | null> {
        return await DiscountModel.findOneAndUpdate(
            { _id: id, usedCount: { $gt: 0 } },
            { $inc: { usedCount: -1 } },
            { returnDocument: "after" }
        );
    }
}
