"use server";

import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand
} from "../api/brands";

export const handleGetBrands = async () => {
    try {
        return await getBrands();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load brands"
        };
    }
}

export const handleCreateBrand = async (brandData: any) => {
    try {
        const result = await createBrand(brandData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Brand created successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create brand"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to create brand"
        };
    }
}

export const handleUpdateBrand = async (id: string, brandData: any) => {
    try {
        const result = await updateBrand(id, brandData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Brand updated successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update brand"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update brand"
        };
    }
}

export const handleDeleteBrand = async (id: string) => {
    try {
        const result = await deleteBrand(id);
        if (result.success) {
            return {
                success: true,
                message: "Brand deleted successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete brand"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete brand"
        };
    }
}
