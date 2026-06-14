import z from "zod";
import { OrderStatusEnum } from "../types/order.type";

export const CheckoutDto = z.object({
    addressId: z.string().trim().min(1, "Shipping address is required"),
    discountCode: z.string().trim().optional(),
});
export type CheckoutDto = z.infer<typeof CheckoutDto>;

export const UpdateOrderStatusDto = z.object({
    orderStatus: OrderStatusEnum,
});
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDto>;
