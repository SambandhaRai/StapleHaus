export type CartVariant = {
    _id?: string;
    size?: string;
    color?: string;
    sku?: string;
    stock?: number;
    priceOverride?: number;
};

export type CartProduct = {
    _id: string;
    name?: string;
    slug?: string;
    images?: string[];
    basePrice?: number;
    variants?: CartVariant[];
    brand?: { name?: string; slug?: string } | string | null;
    gender?: "m" | "f" | "unisex";
};

export type CartItem = {
    _id: string;
    productId?: CartProduct | string | null;
    variantSku?: string;
    quantity?: number;
};

export type CartData = {
    _id?: string;
    items?: CartItem[];
};

export type DiscountState = {
    code: string;
    amount: number;
};
