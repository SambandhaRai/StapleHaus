import mongoose, { Document, Schema } from "mongoose";

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
}, { timestamps: true });

CategorySchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
