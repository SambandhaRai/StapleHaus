import { DiscountRedemptionModel, IDiscountRedemption } from "../models/discount-redemption.model";

export interface IDiscountRedemptionRepository {
    create(code: string, userId: string): Promise<IDiscountRedemption>;
    remove(code: string, userId: string): Promise<void>;
}

export class DiscountRedemptionRepository implements IDiscountRedemptionRepository {

    async create(code: string, userId: string): Promise<IDiscountRedemption> {
        return await DiscountRedemptionModel.create({ code: code.toUpperCase(), userId });
    }

    async remove(code: string, userId: string): Promise<void> {
        await DiscountRedemptionModel.deleteOne({ code: code.toUpperCase(), userId });
    }
}
