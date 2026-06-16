export type DiscountRecord = {
    _id: string;
    code?: string;
    type?: string;
    value?: number;
    minSubtotal?: number;
    usageLimit?: number;
    usedCount?: number;
    expiresAt?: string;
    isActive?: boolean;
};

export type DiscountFormState = {
    code: string;
    type: string;
    value: string;
    minSubtotal: string;
    usageLimit: string;
    expiresAt: string;
    isActive: boolean;
};

export const emptyDiscountForm: DiscountFormState = {
    code: "",
    type: "percent",
    value: "",
    minSubtotal: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
};
