import type { AxiosError } from "axios";
import axios from "./axios";
import { API } from "./endpoints";

export type ProductFilters = {
    gender?: "m" | "f" | "unisex";
    category?: string;
    brand?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    sort?: "newest" | "price_asc" | "price_desc" | "rating";
    page?: number;
    limit?: number;
};

type ApiErrorResponse = {
    message?: string;
};

const getApiErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getProducts = async (filters?: ProductFilters) => {
    try {
        const response = await axios.get(
            API.PRODUCT.GET_ALL(filters)
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to load products"));
    }
}

export const getProductBySlug = async (slug: string) => {
    try {
        const response = await axios.get(
            API.PRODUCT.GET_BY_SLUG(slug)
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to load product"));
    }
}

export const createProduct = async (productData: FormData) => {
    try {
        const response = await axios.post(
            API.PRODUCT.CREATE,
            productData
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to create product"));
    }
}

export const updateProduct = async (id: string, productData: FormData) => {
    try {
        const response = await axios.patch(
            API.PRODUCT.UPDATE(id),
            productData
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to update product"));
    }
}

export const deleteProduct = async (id: string) => {
    try {
        const response = await axios.delete(
            API.PRODUCT.DELETE(id)
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to delete product"));
    }
}
