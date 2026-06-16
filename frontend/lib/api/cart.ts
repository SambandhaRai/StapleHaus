import axios from "./axios";
import { API } from "./endpoints";

export const getCart = async () => {
    try {
        const response = await axios.get(
            API.CART.GET
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load cart"
        );
    }
}

export const addToCart = async (itemData: any) => {
    try {
        const response = await axios.post(
            API.CART.ADD_ITEM,
            itemData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to add item to cart"
        );
    }
}

export const updateCartItem = async (itemId: string, quantity: number) => {
    try {
        const response = await axios.patch(
            API.CART.UPDATE_ITEM(itemId),
            { quantity }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update cart item"
        );
    }
}

export const removeCartItem = async (itemId: string) => {
    try {
        const response = await axios.delete(
            API.CART.REMOVE_ITEM(itemId)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to remove cart item"
        );
    }
}
