import { CartModel, ICart } from "../models/cart.model";
import { CartItemType } from "../types/cart.type";

export interface ICartRepository {
    getByUserId(userId: string): Promise<ICart | null>;
    getPopulatedByUserId(userId: string): Promise<ICart | null>;
    createCart(userId: string): Promise<ICart>;
    addNewItem(userId: string, item: CartItemType): Promise<ICart | null>;
    incrementItemQuantity(userId: string, productId: string, variantSku: string, quantity: number): Promise<ICart | null>;
    setItemQuantity(userId: string, itemId: string, quantity: number): Promise<ICart | null>;
    removeItem(userId: string, itemId: string): Promise<ICart | null>;
    clearItems(userId: string): Promise<ICart | null>;
}

export class CartRepository implements ICartRepository {

    async getByUserId(userId: string): Promise<ICart | null> {
        return await CartModel.findOne({ userId });
    }

    async getPopulatedByUserId(userId: string): Promise<ICart | null> {
        return await CartModel.findOne({ userId }).populate({
            path: "items.productId",
            select: "name slug images basePrice variants brand gender",
            populate: {
                path: "brand",
                select: "name slug",
            },
        });
    }

    async createCart(userId: string): Promise<ICart> {
        return await CartModel.create({ userId, items: [] });
    }

    async addNewItem(userId: string, item: CartItemType): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId },
            { $push: { items: item } },
            { returnDocument: "after" }
        );
    }

    async incrementItemQuantity(userId: string, productId: string, variantSku: string, quantity: number): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId, items: { $elemMatch: { productId, variantSku } } },
            { $inc: { "items.$.quantity": quantity } },
            { returnDocument: "after" }
        );
    }

    async setItemQuantity(userId: string, itemId: string, quantity: number): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId, "items._id": itemId },
            { $set: { "items.$.quantity": quantity } },
            { returnDocument: "after" }
        );
    }

    async removeItem(userId: string, itemId: string): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId },
            { $pull: { items: { _id: itemId } } },
            { returnDocument: "after" }
        );
    }

    async clearItems(userId: string): Promise<ICart | null> {
        return await CartModel.findOneAndUpdate(
            { userId },
            { $set: { items: [] } },
            { returnDocument: "after" }
        );
    }
}
