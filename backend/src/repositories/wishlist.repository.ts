import { WishlistModel, IWishlist } from "../models/wishlist.model";

export interface IWishlistRepository {
    getByUserId(userId: string): Promise<IWishlist | null>;
    getPopulatedByUserId(userId: string): Promise<IWishlist | null>;
    createWishlist(userId: string): Promise<IWishlist>;
    addProduct(userId: string, productId: string): Promise<IWishlist | null>;
    removeProduct(userId: string, productId: string): Promise<IWishlist | null>;
}

export class WishlistRepository implements IWishlistRepository {

    async getByUserId(userId: string): Promise<IWishlist | null> {
        return await WishlistModel.findOne({ userId });
    }

    async getPopulatedByUserId(userId: string): Promise<IWishlist | null> {
        return await WishlistModel.findOne({ userId }).populate(
            "productIds",
            "name slug images basePrice avgRating"
        );
    }

    async createWishlist(userId: string): Promise<IWishlist> {
        return await WishlistModel.create({ userId, productIds: [] });
    }

    async addProduct(userId: string, productId: string): Promise<IWishlist | null> {
        return await WishlistModel.findOneAndUpdate(
            { userId },
            { $addToSet: { productIds: productId } },
            { returnDocument: "after" }
        );
    }

    async removeProduct(userId: string, productId: string): Promise<IWishlist | null> {
        return await WishlistModel.findOneAndUpdate(
            { userId },
            { $pull: { productIds: productId } },
            { returnDocument: "after" }
        );
    }
}
