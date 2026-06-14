import mongoose, { Document, Schema } from "mongoose";
import { GenderType } from "../types/product.type";

const VariantSchema: Schema = new Schema({
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    priceOverride: { type: Number, min: 0 },
}, { _id: true });

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    gender: { type: String, enum: ["m", "f", "unisex"], required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    basePrice: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.index({ name: "text" });
ProductSchema.index({ gender: 1, category: 1, brand: 1 });
ProductSchema.index({ "variants.sku": 1 }, { unique: true });

ProductSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IVariant {
    _id: mongoose.Types.ObjectId;
    size: string;
    color: string;
    sku: string;
    stock: number;
    priceOverride?: number;
}

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    brand: mongoose.Types.ObjectId;
    gender: GenderType;
    category: mongoose.Types.ObjectId;
    basePrice: number;
    images: string[];
    variants: IVariant[];
    avgRating: number;
    reviewCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
