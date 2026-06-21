import mongoose from "mongoose";
import { ReviewModel, IReview } from "../models/review.model";

type CreateReviewData = {
    productId: string;
    userId: string;
    rating: number;
    body: string;
};

export interface IReviewRepository {
    createReview(data: CreateReviewData): Promise<IReview>;
    getReviewsByProductId(productId: string): Promise<IReview[]>;
    getReviewById(id: string): Promise<IReview | null>;
    deleteReviewById(id: string): Promise<boolean | null>;
    getProductRatingStats(productId: string): Promise<{ avgRating: number; reviewCount: number }>;
}

export class ReviewRepository implements IReviewRepository {

    async createReview(data: CreateReviewData): Promise<IReview> {
        return await ReviewModel.create(data);
    }

    async getReviewsByProductId(productId: string): Promise<IReview[]> {
        return await ReviewModel.find({ productId })
            .populate("userId", "name")
            .sort({ createdAt: -1 });
    }

    async getReviewById(id: string): Promise<IReview | null> {
        return await ReviewModel.findById(id);
    }

    async deleteReviewById(id: string): Promise<boolean | null> {
        const result = await ReviewModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getProductRatingStats(productId: string): Promise<{ avgRating: number; reviewCount: number }> {
        const result = await ReviewModel.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: "$productId",
                    avgRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 },
                },
            },
        ]);

        if (result.length === 0) {
            return { avgRating: 0, reviewCount: 0 };
        }

        return {
            avgRating: Math.round(result[0].avgRating * 10) / 10,
            reviewCount: result[0].reviewCount,
        };
    }
}
