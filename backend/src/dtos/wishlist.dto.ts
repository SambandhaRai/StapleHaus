import z from "zod";
import { AddWishlistItemSchema } from "../types/wishlist.type";

export const AddWishlistItemDto = AddWishlistItemSchema;
export type AddWishlistItemDto = z.infer<typeof AddWishlistItemDto>;
