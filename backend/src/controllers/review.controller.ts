import { CreateReviewDto } from "../dtos/review.dto";
import { ReviewService } from "../services/review.service";
import { Request, Response } from "express";
import z from "zod";

let reviewService = new ReviewService();

export class ReviewController {

    async getProductReviews(req: Request, res: Response) {
        try {
            const productId = req.params.productId as string;
            const reviews = await reviewService.getProductReviews(productId);
            return res.status(200).json({
                success: true,
                data: reviews,
                message: "Reviews fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async createReview(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const productId = req.params.productId as string;
            const parsedData = CreateReviewDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const review = await reviewService.createReview(userId, productId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: review,
                message: "Review submitted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteReview(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const role = req.user?.role;
            if (!userId || !role) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const reviewId = req.params.id as string;
            await reviewService.deleteReview(userId, role, reviewId);
            return res.status(200).json({
                success: true,
                message: "Review deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
