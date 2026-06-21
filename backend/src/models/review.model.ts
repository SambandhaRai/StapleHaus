import mongoose, { Document, Schema } from "mongoose";

const ReviewSchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, required: true, trim: true },
}, { timestamps: true });

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

ReviewSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
