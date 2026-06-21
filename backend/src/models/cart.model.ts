import mongoose, { Document, Schema } from "mongoose";

const CartItemSchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: true });

const CartSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
}, { timestamps: true });

CartSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface ICartItem {
    _id: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    variantSku: string;
    quantity: number;
}

export interface ICart extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

export const CartModel = mongoose.model<ICart>("Cart", CartSchema);
