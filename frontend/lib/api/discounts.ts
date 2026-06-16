import axios from "./axios";
import { API } from "./endpoints";

export const validateDiscount = async (data: any) => {
    try {
        const response = await axios.post(
            API.DISCOUNT.VALIDATE,
            data
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Invalid discount code"
        );
    }
}

export const getAllDiscounts = async () => {
    try {
        const response = await axios.get(
            API.ADMIN.DISCOUNT.GET_ALL
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load discounts"
        );
    }
}

export const createDiscount = async (discountData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.DISCOUNT.CREATE,
            discountData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to create discount"
        );
    }
}

export const updateDiscount = async (id: string, discountData: any) => {
    try {
        const response = await axios.patch(
            API.ADMIN.DISCOUNT.UPDATE(id),
            discountData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update discount"
        );
    }
}

export const deleteDiscount = async (id: string) => {
    try {
        const response = await axios.delete(
            API.ADMIN.DISCOUNT.DELETE(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to delete discount"
        );
    }
}
