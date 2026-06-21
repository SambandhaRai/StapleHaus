"use server";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
} from "../api/cart";

export const handleGetCart = async () => {
    try {
        return await getCart();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load cart"
        };
    }
}

export const handleAddToCart = async (itemData: any) => {
    try {
        const result = await addToCart(itemData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Added to cart"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to add item to cart"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to add item to cart"
        };
    }
}

export const handleUpdateCartItem = async (itemId: string, quantity: number) => {
    try {
        const result = await updateCartItem(itemId, quantity);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Cart updated"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update cart item"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update cart item"
        };
    }
}

export const handleRemoveCartItem = async (itemId: string) => {
    try {
        const result = await removeCartItem(itemId);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Item removed from cart"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to remove cart item"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to remove cart item"
        };
    }
}
