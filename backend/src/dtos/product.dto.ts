import z from "zod";
import { ProductSchema, GenderEnum } from "../types/product.type";

export const CreateProductDto = ProductSchema;
export type CreateProductDto = z.infer<typeof CreateProductDto>;

export const UpdateProductDto = ProductSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;

export const ProductQueryDto = z.object({
    gender: GenderEnum.optional(),
    category: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    size: z.string().trim().optional(),
    color: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    q: z.string().trim().optional(),
    sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).default("newest"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ProductQueryDto = z.infer<typeof ProductQueryDto>;
