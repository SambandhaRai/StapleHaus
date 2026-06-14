import z from "zod";

export const GenderEnum = z.enum(["m", "f", "unisex"]);

export const VariantSchema = z.object({
    size: z.string().trim().min(1, "Size is required"),
    color: z.string().trim().min(1, "Color is required"),
    sku: z.string().trim().min(1, "SKU is required"),
    stock: z.number().int().min(0).default(0),
    priceOverride: z.number().min(0).optional(),
});

export const ProductSchema = z.object({
    name: z.string().trim().min(1, "Product name is required"),
    slug: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1, "Description is required"),
    brand: z.string().trim().min(1, "Brand is required"),
    gender: GenderEnum,
    category: z.string().trim().min(1, "Category is required"),
    basePrice: z.number().min(0, "Base price cannot be negative"),
    images: z.array(z.string().trim()).default([]),
    variants: z.array(VariantSchema).default([]),
    isActive: z.boolean().default(true),
});

export type GenderType = z.infer<typeof GenderEnum>;
export type VariantType = z.infer<typeof VariantSchema>;
export type ProductType = z.infer<typeof ProductSchema>;
