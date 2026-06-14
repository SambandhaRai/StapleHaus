import z from "zod";

export const ReviewSchema = z.object({
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    body: z.string().trim().min(1, "Review text is required").max(2000),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
