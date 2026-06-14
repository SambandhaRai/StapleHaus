import z from "zod";
import { DiscountSchema, DiscountBaseSchema } from "../types/discount.type";

export const CreateDiscountDto = DiscountSchema;
export type CreateDiscountDto = z.infer<typeof CreateDiscountDto>;

export const UpdateDiscountDto = DiscountBaseSchema.partial();
export type UpdateDiscountDto = z.infer<typeof UpdateDiscountDto>;

export const ValidateDiscountDto = z.object({
    code: z.string().trim().min(1, "Code is required"),
    subtotal: z.number().min(0, "Subtotal cannot be negative"),
});
export type ValidateDiscountDto = z.infer<typeof ValidateDiscountDto>;
