import { ReviewRepository } from "../repositories/review.repository";
import { ProductRepository } from "../repositories/product.repository";
import { CreateReviewDto } from "../dtos/review.dto";
import { UserRoleType } from "../types/user.type";
import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";

let reviewRepository = new ReviewRepository();
let productRepository = new ProductRepository();

const isDuplicateKeyError = (error: unknown) =>
    typeof error === "object"
    && error !== null
    && "code" in error
    && (error as { code?: unknown }).code === 11000;

export class ReviewService {

    private async recomputeProductRating(productId: string) {
        const stats = await reviewRepository.getProductRatingStats(productId);
        await productRepository.setRatingStats(productId, stats.avgRating, stats.reviewCount);
    }

    async getProductReviews(productId: string) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new HttpError(400, "Invalid product ID");
        }
        return await reviewRepository.getReviewsByProductId(productId);
    }

    async createReview(userId: string, productId: string, data: CreateReviewDto) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new HttpError(400, "Invalid product ID");
        }

        const product = await productRepository.getProductById(productId);
        if (!product) {
            throw new HttpError(404, "Product not found");
        }

        let review;
        try {
            review = await reviewRepository.createReview({
                productId,
                userId,
                rating: data.rating,
                body: data.body,
            });
        } catch (error: unknown) {
            if (isDuplicateKeyError(error)) {
                throw new HttpError(409, "You have already reviewed this product");
            }
            throw error;
        }

        await this.recomputeProductRating(productId);
        return review;
    }

    async deleteReview(userId: string, role: UserRoleType, reviewId: string) {
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            throw new HttpError(400, "Invalid review ID");
        }

        const review = await reviewRepository.getReviewById(reviewId);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        if (review.userId.toString() !== userId && role !== "admin") {
            throw new HttpError(403, "You do not have permission to delete this review");
        }

        const productId = review.productId.toString();
        await reviewRepository.deleteReviewById(reviewId);
        await this.recomputeProductRating(productId);

        return true;
    }
}
