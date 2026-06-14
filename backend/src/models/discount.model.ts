import mongoose, { Document, Schema } from "mongoose";
import { DiscountTypeType } from "../types/discount.type";

const DiscountSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, min: 0 },
    expiresAt: { type: Date },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

DiscountSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IDiscount extends Document {
    _id: mongoose.Types.ObjectId;
    code: string;
    type: DiscountTypeType;
    value: number;
    minSubtotal?: number;
    expiresAt?: Date;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const DiscountModel = mongoose.model<IDiscount>("Discount", DiscountSchema);
