import z from "zod";

export const DiscountTypeEnum = z.enum(["percent", "fixed"]);

export const DiscountBaseSchema = z.object({
    code: z.string().trim().min(1, "Code is required"),
    type: DiscountTypeEnum,
    value: z.number().positive("Value must be greater than 0"),
    minSubtotal: z.number().min(0).optional(),
    expiresAt: z.coerce.date().optional(),
    usageLimit: z.number().int().positive().optional(),
    isActive: z.boolean().default(true),
});

export const DiscountSchema = DiscountBaseSchema.superRefine((data, ctx) => {
    if (data.type === "percent" && data.value > 100) {
        ctx.addIssue({
            code: "custom",
            path: ["value"],
            message: "Percent discount cannot exceed 100",
        });
    }
});

export type DiscountTypeType = z.infer<typeof DiscountTypeEnum>;
export type DiscountType = z.infer<typeof DiscountSchema>;
