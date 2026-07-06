import mongoose, { Document, Schema } from "mongoose";
import { AddressSchema } from "./user.model";
import { OrderStatusType, PaymentStatusType } from "../types/order.type";

const OrderItemSchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    size: { type: String, required: true },
    color: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
}, { _id: true });

const OrderSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: AddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: {
        code: { type: String },
        amount: { type: Number, default: 0, min: 0 },
    },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "esewa" },
    transactionUuid: { type: String, unique: true, sparse: true },
    paymentRef: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: { type: String, enum: ["pending", "paid", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

OrderSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IOrderItem {
    _id: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    name: string;
    image?: string;
    size: string;
    color: string;
    unitPrice: number;
    quantity: number;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: Record<string, unknown>;
    subtotal: number;
    discount: { code?: string; amount: number };
    total: number;
    paymentMethod: string;
    transactionUuid?: string;
    paymentRef?: string;
    paymentStatus: PaymentStatusType;
    orderStatus: OrderStatusType;
    createdAt: Date;
    updatedAt: Date;
}

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
