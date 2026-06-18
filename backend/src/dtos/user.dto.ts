import z from "zod";
import { BaseUserSchema, AddressSchema } from "../types/user.type";

export const RegisterUserDto = BaseUserSchema.pick({
    name: true,
    email: true,
    password: true,
});
export type RegisterUserDto = z.infer<typeof RegisterUserDto>;

export const LoginUserDto = z.object({
    email: z.email("Invalid email address"),
    password: z.string().trim().min(1, "Password is required"),
});
export type LoginUserDto = z.infer<typeof LoginUserDto>;

export const VerifyOtpDto = z.object({
    email: z.email("Invalid email address"),
    otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpDto = z.infer<typeof VerifyOtpDto>;

export const ResendOtpDto = z.object({
    email: z.email("Invalid email address"),
});
export type ResendOtpDto = z.infer<typeof ResendOtpDto>;

export const UpdateUserDto = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const CreateAddressDto = AddressSchema;
export type CreateAddressDto = z.infer<typeof CreateAddressDto>;

export const UpdateAddressDto = AddressSchema.partial();
export type UpdateAddressDto = z.infer<typeof UpdateAddressDto>;
