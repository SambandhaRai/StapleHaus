import z from "zod";

export const BrandSchema = z.object({
    name: z.string().trim().min(1, "Brand name is required"),
    slug: z.string().trim().min(1).optional(),
    logo: z.string().trim().optional(),
});

export type BrandType = z.infer<typeof BrandSchema>;
