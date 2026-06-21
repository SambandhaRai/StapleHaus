import mongoose, { Document, Schema } from "mongoose";

const BrandSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    logo: { type: String, trim: true },
}, { timestamps: true });

BrandSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IBrand extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    logo?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const BrandModel = mongoose.model<IBrand>("Brand", BrandSchema);
