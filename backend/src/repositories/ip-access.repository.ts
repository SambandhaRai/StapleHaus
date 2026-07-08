import { IIpAccess, IpAccessModel } from "../models/ip-access.model";
import { IpAccessModeType } from "../types/ip-access.type";

type CreateIpAccessData = {
    address: string;
    mode: IpAccessModeType;
    reason?: string;
    createdBy?: string;
};

export interface IIpAccessRepository {
    listEntries(): Promise<IIpAccess[]>;
    findByAddress(address: string): Promise<IIpAccess | null>;
    createEntry(data: CreateIpAccessData): Promise<IIpAccess>;
    deleteEntryById(id: string): Promise<IIpAccess | null>;
}

export class IpAccessRepository implements IIpAccessRepository {

    async listEntries(): Promise<IIpAccess[]> {
        return await IpAccessModel.find().sort({ createdAt: -1 });
    }

    async findByAddress(address: string): Promise<IIpAccess | null> {
        return await IpAccessModel.findOne({ address });
    }

    async createEntry(data: CreateIpAccessData): Promise<IIpAccess> {
        return await IpAccessModel.create(data);
    }

    async deleteEntryById(id: string): Promise<IIpAccess | null> {
        return await IpAccessModel.findByIdAndDelete(id);
    }
}
