"use server";

import {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from "../api/wishlist";

export const handleGetWishlist = async () => {
    try {
        return await getWishlist();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load wishlist"
        };
    }
}

export const handleAddToWishlist = async (productId: string) => {
    try {
        const result = await addToWishlist(productId);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Added to wishlist"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to add to wishlist"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to add to wishlist"
        };
    }
}

export const handleRemoveFromWishlist = async (productId: string) => {
    try {
        const result = await removeFromWishlist(productId);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Removed from wishlist"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to remove from wishlist"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to remove from wishlist"
        };
    }
}
