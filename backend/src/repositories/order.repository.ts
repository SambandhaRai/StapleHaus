import { OrderModel, IOrder, IOrderItem } from "../models/order.model";
import { OrderStatusType, PaymentStatusType } from "../types/order.type";

type CreateOrderData = {
    userId: string;
    items: Omit<IOrderItem, "_id">[];
    shippingAddress: Record<string, unknown>;
    subtotal: number;
    discount: { code?: string; amount: number };
    total: number;
    paymentStatus: PaymentStatusType;
    orderStatus: OrderStatusType;
};

export interface IOrderRepository {
    createOrder(data: CreateOrderData): Promise<IOrder>;
    getOrdersByUserId(userId: string): Promise<IOrder[]>;
    getOrderById(id: string): Promise<IOrder | null>;
    getAllOrders(): Promise<IOrder[]>;
    updateOrderStatus(id: string, orderStatus: OrderStatusType): Promise<IOrder | null>;
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
}
