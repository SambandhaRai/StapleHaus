import z from "zod";

export const CategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required"),
    slug: z.string().trim().min(1).optional(),
});

export type CategoryType = z.infer<typeof CategorySchema>;
