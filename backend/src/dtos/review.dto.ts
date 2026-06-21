import z from "zod";
import { ReviewSchema } from "../types/review.type";

export const CreateReviewDto = ReviewSchema;
export type CreateReviewDto = z.infer<typeof CreateReviewDto>;
