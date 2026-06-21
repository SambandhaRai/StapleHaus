import { WishlistRepository } from "../repositories/wishlist.repository";
import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

let wishlistRepository = new WishlistRepository();
let productRepository = new ProductRepository();

export class WishlistService {

    private async getOrCreateWishlist(userId: string) {
        let wishlist = await wishlistRepository.getByUserId(userId);
        if (!wishlist) {
            wishlist = await wishlistRepository.createWishlist(userId);
        }
        return wishlist;
    }

    async getWishlist(userId: string) {
        await this.getOrCreateWishlist(userId);
        return await wishlistRepository.getPopulatedByUserId(userId);
    }

    async addItem(userId: string, productId: string) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new HttpError(400, "Invalid product ID");
        }

        const product = await productRepository.getProductById(productId);
        if (!product) {
            throw new HttpError(404, "Product not found");
        }

        await this.getOrCreateWishlist(userId);
        await wishlistRepository.addProduct(userId, productId);
        return await wishlistRepository.getPopulatedByUserId(userId);
    }

    async removeItem(userId: string, productId: string) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new HttpError(400, "Invalid product ID");
        }

        const updated = await wishlistRepository.removeProduct(userId, productId);
        if (!updated) {
            throw new HttpError(404, "Wishlist not found");
        }
        return await wishlistRepository.getPopulatedByUserId(userId);
    }
}
