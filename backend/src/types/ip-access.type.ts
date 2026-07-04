import z from "zod";

export const IpAccessModeEnum = z.enum(["block", "allow"]);

export type IpAccessModeType = z.infer<typeof IpAccessModeEnum>;
