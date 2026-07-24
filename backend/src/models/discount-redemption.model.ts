import mongoose, { Document, Schema } from "mongoose";

const DiscountRedemptionSchema: Schema = new Schema({
    code: { type: String, required: true, trim: true, uppercase: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

DiscountRedemptionSchema.index({ code: 1, userId: 1 }, { unique: true });

export interface IDiscountRedemption extends Document {
    _id: mongoose.Types.ObjectId;
    code: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const DiscountRedemptionModel = mongoose.model<IDiscountRedemption>("DiscountRedemption", DiscountRedemptionSchema);
