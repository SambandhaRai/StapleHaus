import mongoose, { Document, Schema } from "mongoose";
import { AddressType, UserRoleType } from "../types/user.type";

export const AddressSchema: Schema = new Schema({
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
}, { _id: true });

const UserSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [AddressSchema], default: [] },
}, { timestamps: true });

UserSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const serialized = ret as Record<string, unknown>;
        delete serialized.passwordHash;
        delete serialized.__v;
        return ret;
    },
});

export interface IAddress extends AddressType {
    _id: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRoleType;
    addresses: IAddress[];
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
