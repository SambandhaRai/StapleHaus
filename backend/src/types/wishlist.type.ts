import z from "zod";

export const AddWishlistItemSchema = z.object({
    productId: z.string().trim().min(1, "Product is required"),
});

export type AddWishlistItemType = z.infer<typeof AddWishlistItemSchema>;
