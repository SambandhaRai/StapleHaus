export type OrderRecord = {
    _id: string;
    items?: unknown[];
    total?: number;
    paymentStatus?: string;
    orderStatus?: string;
    createdAt?: string;
};

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
