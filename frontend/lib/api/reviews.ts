import type { AxiosError } from "axios";
import axios from "./axios";
import { API } from "./endpoints";

export type ReviewPayload = {
    rating: number;
    body: string;
};

type ApiErrorResponse = {
    message?: string;
};

const getApiErrorMessage = (err: unknown, fallback: string) => {
    const error = err as AxiosError<ApiErrorResponse>;
    return error.response?.data?.message || error.message || fallback;
};

export const getProductReviews = async (productId: string) => {
    try {
        const response = await axios.get(
            API.REVIEW.GET_FOR_PRODUCT(productId)
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to load reviews"));
    }
}

export const createReview = async (productId: string, reviewData: ReviewPayload) => {
    try {
        const response = await axios.post(
            API.REVIEW.CREATE(productId),
            reviewData
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to submit review"));
    }
}

export const deleteReview = async (id: string) => {
    try {
        const response = await axios.delete(
            API.REVIEW.DELETE(id)
        );
        return response.data;
    } catch (err: unknown) {
        throw new Error(getApiErrorMessage(err, "Failed to delete review"));
    }
}
