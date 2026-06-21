import axios from "./axios";
import { API } from "./endpoints";

export const getCategories = async () => {
    try {
        const response = await axios.get(
            API.CATEGORY.GET_ALL
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load categories"
        );
    }
}

export const createCategory = async (categoryData: any) => {
    try {
        const response = await axios.post(
            API.CATEGORY.CREATE,
            categoryData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to create category"
        );
    }
}

export const updateCategory = async (id: string, categoryData: any) => {
    try {
        const response = await axios.patch(
            API.CATEGORY.UPDATE(id),
            categoryData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update category"
        );
    }
}

export const deleteCategory = async (id: string) => {
    try {
        const response = await axios.delete(
            API.CATEGORY.DELETE(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to delete category"
        );
    }
}
