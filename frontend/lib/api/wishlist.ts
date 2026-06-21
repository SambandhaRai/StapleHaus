import axios from "./axios";
import { API } from "./endpoints";

export const getWishlist = async () => {
    try {
        const response = await axios.get(
            API.WISHLIST.GET
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load wishlist"
        );
    }
}

export const addToWishlist = async (productId: string) => {
    try {
        const response = await axios.post(
            API.WISHLIST.ADD_ITEM,
            { productId }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to add to wishlist"
        );
    }
}

export const removeFromWishlist = async (productId: string) => {
    try {
        const response = await axios.delete(
            API.WISHLIST.REMOVE_ITEM(productId)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to remove from wishlist"
        );
    }
}
