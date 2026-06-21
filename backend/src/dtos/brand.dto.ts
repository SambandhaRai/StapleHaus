import z from "zod";
import { BrandSchema } from "../types/brand.type";

export const CreateBrandDto = BrandSchema;
export type CreateBrandDto = z.infer<typeof CreateBrandDto>;

export const UpdateBrandDto = BrandSchema.partial();
export type UpdateBrandDto = z.infer<typeof UpdateBrandDto>;
