import { SessionRepository } from "../repositories/session.repository";
import { ISession } from "../models/session.model";
import { HttpError } from "../errors/http-error";
import { RequestContext } from "../types/activity-log.type";
import mongoose from "mongoose";

let sessionRepository = new SessionRepository();

const SESSION_ABSOLUTE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_IDLE_TTL_MS = 15 * 24 * 60 * 60 * 1000;

export class SessionService {

    async createSession(userId: string, context: RequestContext): Promise<ISession> {
        return await sessionRepository.createSession({
            userId,
            userAgent: context.userAgent,
            ip: context.ip,
            expiresAt: new Date(Date.now() + SESSION_ABSOLUTE_TTL_MS),
        });
    }

    async isKnownDevice(userId: string, userAgent?: string): Promise<boolean> {
        if (!userAgent) {
            return true;
        }
        return await sessionRepository.countSessionsByUserAndAgent(userId, userAgent) > 0;
    }

    async validateSession(sessionId: string | undefined, userId: string, context: RequestContext): Promise<ISession | null> {
        if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
            return null;
        }

        const session = await sessionRepository.getSessionById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            return null;
        }
        if (session.revokedAt) {
            return null;
        }

        const now = Date.now();
        if (session.expiresAt.getTime() < now) {
            return null;
        }
        if (now - session.lastUsedAt.getTime() > SESSION_IDLE_TTL_MS) {
            await sessionRepository.revokeSession(sessionId, new Date());
            return null;
        }
        if (session.userAgent && context.userAgent && session.userAgent !== context.userAgent) {
            return null;
        }

        await sessionRepository.touchSession(sessionId, new Date(now));
        return session;
    }

    async listSessions(userId: string): Promise<ISession[]> {
        return await sessionRepository.getActiveSessionsByUser(userId, new Date());
    }

    async revokeSession(sessionId: string): Promise<void> {
        await sessionRepository.revokeSession(sessionId, new Date());
    }

    async revokeSessionForUser(sessionId: string, userId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new HttpError(400, "Invalid session ID");
        }
        const session = await sessionRepository.getSessionById(sessionId);
        if (!session || session.userId.toString() !== userId) {
            throw new HttpError(404, "Session not found");
        }
        await sessionRepository.revokeSession(sessionId, new Date());
    }

    async revokeOtherSessions(userId: string, keepSessionId?: string): Promise<void> {
        await sessionRepository.revokeSessionsByUser(userId, new Date(), keepSessionId);
    }

    async revokeAllSessions(userId: string): Promise<void> {
        await sessionRepository.revokeSessionsByUser(userId, new Date());
    }
}
