import z from "zod";

export const CartItemSchema = z.object({
    productId: z.string().trim().min(1, "Product is required"),
    variantSku: z.string().trim().min(1, "Variant SKU is required"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
});

export type CartItemType = z.infer<typeof CartItemSchema>;
