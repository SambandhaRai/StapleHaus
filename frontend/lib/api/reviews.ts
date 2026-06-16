import axios from "./axios";
import { API } from "./endpoints";

export const getProductReviews = async (productId: string) => {
    try {
        const response = await axios.get(
            API.REVIEW.GET_FOR_PRODUCT(productId)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to load reviews"
        );
    }
}

export const createReview = async (productId: string, reviewData: any) => {
    try {
        const response = await axios.post(
            API.REVIEW.CREATE(productId),
            reviewData
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to submit review"
        );
    }
}

export const deleteReview = async (id: string) => {
    try {
        const response = await axios.delete(
            API.REVIEW.DELETE(id)
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to delete review"
        );
    }
}
