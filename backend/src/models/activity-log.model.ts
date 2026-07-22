import mongoose, { Document, Schema } from "mongoose";
import { ActivityActionType, ActivityStatusType } from "../types/activity-log.type";

const ActivityLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, trim: true, lowercase: true },
    action: { type: String, required: true },
    status: { type: String, enum: ["success", "failure"], required: true },
    ip: { type: String },
    userAgent: { type: String },
    reason: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ email: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

ActivityLogSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>).__v;
        return ret;
    },
});

export interface IActivityLog extends Document {
    _id: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    email?: string;
    action: ActivityActionType;
    status: ActivityStatusType;
    ip?: string;
    userAgent?: string;
    reason?: string;
    createdAt: Date;
}

export const ActivityLogModel = mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
