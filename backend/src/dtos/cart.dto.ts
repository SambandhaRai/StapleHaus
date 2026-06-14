import z from "zod";
import { CartItemSchema } from "../types/cart.type";

export const AddCartItemDto = CartItemSchema;
export type AddCartItemDto = z.infer<typeof AddCartItemDto>;

export const UpdateCartItemDto = z.object({
    quantity: z.number().int().positive("Quantity must be at least 1"),
});
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;
