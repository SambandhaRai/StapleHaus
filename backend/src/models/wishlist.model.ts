import mongoose, { Document, Schema } from "mongoose";

const WishlistSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });

WishlistSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IWishlist extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    productIds: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export const WishlistModel = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
