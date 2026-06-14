import z from "zod";

export const OrderStatusEnum = z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]);
export const PaymentStatusEnum = z.enum(["pending", "paid", "failed"]);

export type OrderStatusType = z.infer<typeof OrderStatusEnum>;
export type PaymentStatusType = z.infer<typeof PaymentStatusEnum>;
