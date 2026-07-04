import z from "zod";
import { IpAccessModeEnum } from "../types/ip-access.type";

export const CreateIpAccessDto = z.object({
    address: z.union([z.ipv4(), z.ipv6()], "A valid IPv4 or IPv6 address is required"),
    mode: IpAccessModeEnum,
    reason: z.string().trim().max(200).optional(),
});

export type CreateIpAccessDto = z.infer<typeof CreateIpAccessDto>;
