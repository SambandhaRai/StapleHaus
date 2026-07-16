import { OrderModel, IOrder, IOrderItem } from "../models/order.model";
import { OrderStatusType, PaymentStatusType } from "../types/order.type";

type CreateOrderData = {
    userId: string;
    items: Omit<IOrderItem, "_id">[];
    shippingAddress: Record<string, unknown>;
    subtotal: number;
    discount: { code?: string; amount: number };
    total: number;
    transactionUuid?: string;
    paymentMethod?: string;
    paymentStatus: PaymentStatusType;
    orderStatus: OrderStatusType;
};

type PaymentResult = {
    paymentStatus: PaymentStatusType;
    orderStatus: OrderStatusType;
    paymentRef?: string;
};

export interface IOrderRepository {
    createOrder(data: CreateOrderData): Promise<IOrder>;
    getOrdersByUserId(userId: string): Promise<IOrder[]>;
    getOrderById(id: string): Promise<IOrder | null>;
    getByTransactionUuid(transactionUuid: string): Promise<IOrder | null>;
    getAllOrders(): Promise<IOrder[]>;
    getExpiredPendingOrders(cutoff: Date): Promise<IOrder[]>;
    updateOrderStatus(id: string, orderStatus: OrderStatusType): Promise<IOrder | null>;
    updatePaymentResult(id: string, result: PaymentResult): Promise<IOrder | null>;
    markExpiredIfPending(id: string): Promise<IOrder | null>;
}

export class OrderRepository implements IOrderRepository {

    async createOrder(data: CreateOrderData): Promise<IOrder> {
        return await OrderModel.create(data);
    }

    async getOrdersByUserId(userId: string): Promise<IOrder[]> {
        return await OrderModel.find({ userId }).sort({ createdAt: -1 });
    }

    async getOrderById(id: string): Promise<IOrder | null> {
        return await OrderModel.findById(id);
    }

    async getByTransactionUuid(transactionUuid: string): Promise<IOrder | null> {
        return await OrderModel.findOne({ transactionUuid });
    }

    async getAllOrders(): Promise<IOrder[]> {
        return await OrderModel.find().sort({ createdAt: -1 });
    }

    async updateOrderStatus(id: string, orderStatus: OrderStatusType): Promise<IOrder | null> {
        return await OrderModel.findByIdAndUpdate(
            id,
            { $set: { orderStatus } },
            { returnDocument: "after" }
        );
    }

    async updatePaymentResult(id: string, result: PaymentResult): Promise<IOrder | null> {
        return await OrderModel.findByIdAndUpdate(
            id,
            { $set: result },
            { returnDocument: "after" }
        );
    }

    async getExpiredPendingOrders(cutoff: Date): Promise<IOrder[]> {
        return await OrderModel.find({
            paymentStatus: "pending",
            paymentMethod: { $ne: "cod" },
            createdAt: { $lt: cutoff },
        });
    }

    async markExpiredIfPending(id: string): Promise<IOrder | null> {
        return await OrderModel.findOneAndUpdate(
            { _id: id, paymentStatus: "pending", paymentMethod: { $ne: "cod" } },
            { $set: { paymentStatus: "failed", orderStatus: "cancelled" } },
            { returnDocument: "after" }
        );
    }
}
