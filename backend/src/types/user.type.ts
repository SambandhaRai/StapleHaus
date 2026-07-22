import z from "zod";
import { stripHtml } from "../utils/sanitize";

export const UserRoleEnum = z.enum(["customer", "admin"]);

export const AddressSchema = z.object({
    label: z.string().trim().min(1, "Label is required"),
    line1: z.string().trim().min(1, "Address line 1 is required"),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().min(1, "Postal code is required"),
    country: z.string().trim().min(1, "Country is required"),
    phone: z.string().trim().min(1, "Phone is required"),
});

export const BaseUserSchema = z.object({
    name: z.string().trim().transform(stripHtml).pipe(z.string().min(2, "Name must be at least 2 characters")),
    email: z.email("Invalid email address"),
    password: z.string()
        .trim()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be 128 characters or fewer")
        .regex(/[a-z]/, "Password must include a lowercase letter")
        .regex(/[A-Z]/, "Password must include an uppercase letter")
        .regex(/\d/, "Password must include a number")
        .regex(/[^A-Za-z0-9]/, "Password must include a symbol"),
    role: UserRoleEnum.default("customer"),
    addresses: z.array(AddressSchema).default([]),
});

export type UserRoleType = z.infer<typeof UserRoleEnum>;
export type AddressType = z.infer<typeof AddressSchema>;
export type UserType = z.infer<typeof BaseUserSchema>;
