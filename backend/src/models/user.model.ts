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
    password: { type: String },
    googleId: { type: String, trim: true, unique: true, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [AddressSchema], default: [] },
}, { timestamps: true });

UserSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const serialized = ret as Record<string, unknown>;
        delete serialized.password;
        delete serialized.otpHash;
        delete serialized.otpExpiresAt;
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
    password?: string;
    googleId?: string;
    isEmailVerified: boolean;
    otpHash?: string;
    otpExpiresAt?: Date;
    role: UserRoleType;
    addresses: IAddress[];
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
