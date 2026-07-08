import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { IpAccessRepository } from "../repositories/ip-access.repository";
import { ActivityLogService } from "./activity-log.service";
import { CreateIpAccessDto } from "../dtos/ip-access.dto";
import { IpAccessModeType } from "../types/ip-access.type";
import { RequestContext } from "../types/activity-log.type";

const ipAccessRepository = new IpAccessRepository();
const activityLogService = new ActivityLogService();

const CACHE_TTL_MS = 30 * 1000;

export class IpAccessService {

    private static cache = new Map<string, IpAccessModeType>();
    private static cacheExpiresAt = 0;

    normalizeAddress(address: string): string {
        const trimmed = address.trim().toLowerCase();
        return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
    }

    async getMode(address: string): Promise<IpAccessModeType | undefined> {
        await this.ensureCache();
        return IpAccessService.cache.get(this.normalizeAddress(address));
    }

    async listEntries() {
        return await ipAccessRepository.listEntries();
    }

    async createEntry(data: CreateIpAccessDto, createdBy: string, context: RequestContext = {}) {
        const address = this.normalizeAddress(data.address);

        const existing = await ipAccessRepository.findByAddress(address);
        if (existing) {
            throw new HttpError(409, "An entry for this IP address already exists");
        }

        const entry = await ipAccessRepository.createEntry({
            address,
            mode: data.mode,
            reason: data.reason,
            createdBy,
        });
        IpAccessService.cacheExpiresAt = 0;

        await activityLogService.record({
            ...context,
            action: "ip_access_add",
            status: "success",
            userId: createdBy,
            reason: `${data.mode} ${address}`,
        });

        return entry;
    }

    async deleteEntry(id: string, deletedBy: string, context: RequestContext = {}) {
        if (!mongoose.isValidObjectId(id)) {
            throw new HttpError(404, "IP access entry not found");
        }

        const entry = await ipAccessRepository.deleteEntryById(id);
        if (!entry) {
            throw new HttpError(404, "IP access entry not found");
        }
        IpAccessService.cacheExpiresAt = 0;

        await activityLogService.record({
            ...context,
            action: "ip_access_remove",
            status: "success",
            userId: deletedBy,
            reason: `${entry.mode} ${entry.address}`,
        });

        return entry;
    }

    private async ensureCache(): Promise<void> {
        if (Date.now() < IpAccessService.cacheExpiresAt) {
            return;
        }
        const entries = await ipAccessRepository.listEntries();
        const next = new Map<string, IpAccessModeType>();
        for (const entry of entries) {
            next.set(entry.address, entry.mode);
        }
        IpAccessService.cache = next;
        IpAccessService.cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }
}
