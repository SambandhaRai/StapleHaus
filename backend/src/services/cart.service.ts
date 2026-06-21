import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { AddCartItemDto } from "../dtos/cart.dto";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

let cartRepository = new CartRepository();
let productRepository = new ProductRepository();

export class CartService {

    private async getOrCreateCart(userId: string) {
        let cart = await cartRepository.getByUserId(userId);
        if (!cart) {
            cart = await cartRepository.createCart(userId);
        }
        return cart;
    }

    async getCart(userId: string) {
        await this.getOrCreateCart(userId);
        return await cartRepository.getPopulatedByUserId(userId);
    }

    async addItem(userId: string, data: AddCartItemDto) {
        if (!mongoose.Types.ObjectId.isValid(data.productId)) {
            throw new HttpError(400, "Invalid product ID");
        }

        const product = await productRepository.getProductById(data.productId);
        if (!product) {
            throw new HttpError(404, "Product not found");
        }

        const variant = product.variants.find(v => v.sku === data.variantSku);
        if (!variant) {
            throw new HttpError(404, "Product variant not found");
        }

        const cart = await this.getOrCreateCart(userId);
        const existing = cart.items.find(
            i => i.productId.toString() === data.productId && i.variantSku === data.variantSku
        );

        const desiredQuantity = (existing?.quantity || 0) + data.quantity;
        if (variant.stock < desiredQuantity) {
            throw new HttpError(400, `Only ${variant.stock} item(s) in stock`);
        }

        if (existing) {
            await cartRepository.incrementItemQuantity(userId, data.productId, data.variantSku, data.quantity);
        } else {
            await cartRepository.addNewItem(userId, data);
        }

        return await cartRepository.getPopulatedByUserId(userId);
    }

    async updateItem(userId: string, itemId: string, quantity: number) {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            throw new HttpError(400, "Invalid cart item ID");
        }

        const cart = await cartRepository.getByUserId(userId);
        if (!cart) {
            throw new HttpError(404, "Cart not found");
        }

        const item = cart.items.find(i => i._id.toString() === itemId);
        if (!item) {
            throw new HttpError(404, "Cart item not found");
        }

        const product = await productRepository.getProductById(item.productId.toString());
        const variant = product?.variants.find(v => v.sku === item.variantSku);
        if (variant && variant.stock < quantity) {
            throw new HttpError(400, `Only ${variant.stock} item(s) in stock`);
        }

        await cartRepository.setItemQuantity(userId, itemId, quantity);
        return await cartRepository.getPopulatedByUserId(userId);
    }

    async removeItem(userId: string, itemId: string) {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            throw new HttpError(400, "Invalid cart item ID");
        }

        const updated = await cartRepository.removeItem(userId, itemId);
        if (!updated) {
            throw new HttpError(404, "Cart not found");
        }

        return await cartRepository.getPopulatedByUserId(userId);
    }
}
