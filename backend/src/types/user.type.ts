import z from "zod";

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
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    role: UserRoleEnum.default("customer"),
    addresses: z.array(AddressSchema).default([]),
});

export type UserRoleType = z.infer<typeof UserRoleEnum>;
export type AddressType = z.infer<typeof AddressSchema>;
export type UserType = z.infer<typeof BaseUserSchema>;
