import mongoose, { Document, Schema } from "mongoose";
import { IpAccessModeType } from "../types/ip-access.type";

const IpAccessSchema: Schema = new Schema({
    address: { type: String, required: true, unique: true, trim: true, lowercase: true },
    mode: { type: String, enum: ["block", "allow"], required: true },
    reason: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

IpAccessSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IIpAccess extends Document {
    _id: mongoose.Types.ObjectId;
    address: string;
    mode: IpAccessModeType;
    reason?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const IpAccessModel = mongoose.model<IIpAccess>("IpAccess", IpAccessSchema);
