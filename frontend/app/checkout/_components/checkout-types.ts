export type CheckoutAddress = {
    _id?: string;
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
};

export type CheckoutUser = {
    _id?: string;
    name?: string;
    email?: string;
    addresses?: CheckoutAddress[];
};

export type CheckoutVariant = {
    sku?: string;
    size?: string;
    priceOverride?: number;
};

export type CheckoutProduct = {
    _id: string;
    name?: string;
    basePrice?: number;
    variants?: CheckoutVariant[];
};

export type CheckoutCartItem = {
    _id: string;
    productId?: CheckoutProduct | string | null;
    variantSku?: string;
    quantity?: number;
};

export type CheckoutCart = {
    _id?: string;
    items?: CheckoutCartItem[];
};

export type AppliedDiscount = {
    code: string;
    amount: number;
};

export type CheckoutAddressForm = {
    firstName: string;
    lastName: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
};
