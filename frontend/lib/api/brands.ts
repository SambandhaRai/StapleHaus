import axios from "./axios";
import { API } from "./endpoints";

export const getBrands = async () => {
    try {
        const response = await axios.get(
            API.BRAND.GET_ALL
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load brands"
        );
    }
}

export const createBrand = async (brandData: any) => {
    try {
        const response = await axios.post(
            API.BRAND.CREATE,
            brandData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to create brand"
        );
    }
}

export const updateBrand = async (id: string, brandData: any) => {
    try {
        const response = await axios.patch(
            API.BRAND.UPDATE(id),
            brandData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to update brand"
        );
    }
}

export const deleteBrand = async (id: string) => {
    try {
        const response = await axios.delete(
            API.BRAND.DELETE(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to delete brand"
        );
    }
}
