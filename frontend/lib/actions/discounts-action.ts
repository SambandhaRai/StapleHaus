"use server";

import {
    validateDiscount,
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount
} from "../api/discounts";

export const handleValidateDiscount = async (data: any) => {
    try {
        const result = await validateDiscount(data);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Discount is valid"
            };
        }
        return {
            success: false,
            message: result.message || "Invalid discount code"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Invalid discount code"
        };
    }
}

export const handleGetAllDiscounts = async () => {
    try {
        return await getAllDiscounts();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load discounts"
        };
    }
}

export const handleCreateDiscount = async (discountData: any) => {
    try {
        const result = await createDiscount(discountData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Discount created successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create discount"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to create discount"
        };
    }
}

export const handleUpdateDiscount = async (id: string, discountData: any) => {
    try {
        const result = await updateDiscount(id, discountData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Discount updated successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update discount"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update discount"
        };
    }
}

export const handleDeleteDiscount = async (id: string) => {
    try {
        const result = await deleteDiscount(id);
        if (result.success) {
            return {
                success: true,
                message: "Discount deleted successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete discount"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete discount"
        };
    }
}
