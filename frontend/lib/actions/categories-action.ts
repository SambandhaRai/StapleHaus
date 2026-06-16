"use server";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../api/categories";

export const handleGetCategories = async () => {
    try {
        return await getCategories();
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load categories"
        };
    }
}

export const handleCreateCategory = async (categoryData: any) => {
    try {
        const result = await createCategory(categoryData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Category created successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create category"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to create category"
        };
    }
}

export const handleUpdateCategory = async (id: string, categoryData: any) => {
    try {
        const result = await updateCategory(id, categoryData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Category updated successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update category"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update category"
        };
    }
}

export const handleDeleteCategory = async (id: string) => {
    try {
        const result = await deleteCategory(id);
        if (result.success) {
            return {
                success: true,
                message: "Category deleted successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete category"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete category"
        };
    }
}
