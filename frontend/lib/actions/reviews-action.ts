"use server";

import {
    getProductReviews,
    createReview,
    deleteReview
} from "../api/reviews";

export const handleGetProductReviews = async (productId: string) => {
    try {
        return await getProductReviews(productId);
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to load reviews"
        };
    }
}

export const handleCreateReview = async (productId: string, reviewData: any) => {
    try {
        const result = await createReview(productId, reviewData);
        if (result.success) {
            return {
                success: true,
                data: result.data,
                message: "Review submitted successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to submit review"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to submit review"
        };
    }
}

export const handleDeleteReview = async (id: string) => {
    try {
        const result = await deleteReview(id);
        if (result.success) {
            return {
                success: true,
                message: "Review deleted successfully"
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete review"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete review"
        };
    }
}
