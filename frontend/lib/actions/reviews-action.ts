"use server";

import {
    getProductReviews,
    createReview,
    deleteReview,
    type ReviewPayload,
} from "../api/reviews";

const getActionErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
};

export const handleGetProductReviews = async (productId: string) => {
    try {
        return await getProductReviews(productId);
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to load reviews")
        };
    }
}

export const handleCreateReview = async (productId: string, reviewData: ReviewPayload) => {
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
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to submit review")
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
    } catch (err: unknown) {
        return {
            success: false,
            message: getActionErrorMessage(err, "Failed to delete review")
        };
    }
}
