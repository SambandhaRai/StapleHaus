"use server";

import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
} from "../api/products";

type ProductFilters = Parameters<typeof getProducts>[0];

const getActionErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
};

export const handleGetProducts = async (filters?: ProductFilters) => {
    try {
        return await getProducts(filters);
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to load products")
        };
    }
}

export const handleGetProductBySlug = async (slug: string) => {
    try {
        return await getProductBySlug(slug);
    } catch (err) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to load product")
        };
    }
}

export const handleCreateProduct = async (formData: FormData) => {
    try {
        const result = await createProduct(formData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: result.message || "Product created successfully"
            };
        }
        return { success: false, message: result.message || "Failed to create product" };
    } catch (err) {
        return { success: false, message: getActionErrorMessage(err, "Failed to create product") };
    }
}

export const handleUpdateProduct = async (id: string, formData: FormData) => {
    try {
        const result = await updateProduct(id, formData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: result.message || "Product updated successfully"
            };
        }
        return { success: false, message: result.message || "Failed to update product" };
    } catch (err) {
        return { success: false, message: getActionErrorMessage(err, "Failed to update product") };
    }
}

export const handleDeleteProduct = async (id: string) => {
    try {
        const result = await deleteProduct(id);
        if (result.success) {
            return { success: true, message: "Product deleted successfully" };
        }
        return { success: false, message: result.message || "Failed to delete product" };
    } catch (err) {
        return { success: false, message: getActionErrorMessage(err, "Failed to delete product") };
    }
}
