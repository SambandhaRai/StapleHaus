import z from "zod";
import { CategorySchema } from "../types/category.type";

export const CreateCategoryDto = CategorySchema;
export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;

export const UpdateCategoryDto = CategorySchema.partial();
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
