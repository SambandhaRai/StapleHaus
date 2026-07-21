import { trusted } from "mongoose";
import { ISession, SessionModel } from "../models/session.model";

type CreateSessionData = {
    userId: string;
    userAgent?: string;
    ip?: string;
    expiresAt: Date;
};

export interface ISessionRepository {
    createSession(data: CreateSessionData): Promise<ISession>;
    getSessionById(id: string): Promise<ISession | null>;
    touchSession(id: string, lastUsedAt: Date): Promise<ISession | null>;
    revokeSession(id: string, revokedAt: Date): Promise<ISession | null>;
    getActiveSessionsByUser(userId: string, now: Date): Promise<ISession[]>;
    countSessionsByUserAndAgent(userId: string, userAgent: string): Promise<number>;
    revokeSessionsByUser(userId: string, revokedAt: Date, exceptId?: string): Promise<void>;
}

export class SessionRepository implements ISessionRepository {

    async createSession(data: CreateSessionData): Promise<ISession> {
        return await SessionModel.create(data);
    }

    async getSessionById(id: string): Promise<ISession | null> {
        return await SessionModel.findById(id);
    }

    async touchSession(id: string, lastUsedAt: Date): Promise<ISession | null> {
        return await SessionModel.findByIdAndUpdate(
            id,
            { lastUsedAt },
            { returnDocument: "after" }
        );
    }

    async revokeSession(id: string, revokedAt: Date): Promise<ISession | null> {
        return await SessionModel.findByIdAndUpdate(
            id,
            { revokedAt },
            { returnDocument: "after" }
        );
    }

    async getActiveSessionsByUser(userId: string, now: Date): Promise<ISession[]> {
        return await SessionModel.find({
            userId,
            revokedAt: null,
            expiresAt: trusted({ $gt: now }),
        }).sort({ lastUsedAt: -1 });
    }

    async countSessionsByUserAndAgent(userId: string, userAgent: string): Promise<number> {
        return await SessionModel.countDocuments({ userId, userAgent });
    }

    async revokeSessionsByUser(userId: string, revokedAt: Date, exceptId?: string): Promise<void> {
        const query: Record<string, unknown> = { userId, revokedAt: null };
        if (exceptId) {
            query._id = trusted({ $ne: exceptId });
        }
        await SessionModel.updateMany(query, { revokedAt });
    }
}
