export type VariantRow = {
    size: string;
    stock: string;
};

export type NewImageFile = {
    file: File;
    previewUrl: string;
};

export type ProductFormState = {
    name: string;
    slug: string;
    description: string;
    brand: string;
    category: string;
    gender: string;
    basePrice: string;
    isActive: boolean;
};

export type ProductRecord = {
    _id: string;
    name?: string;
    slug?: string;
    description?: string;
    brand?: { _id?: string; name?: string } | string | null;
    category?: { _id?: string; name?: string } | string | null;
    gender?: string;
    basePrice?: number;
    images?: string[];
    variants?: Array<{ size?: string; stock?: number }>;
    isActive?: boolean;
};

export type ProductOption = {
    _id: string;
    name: string;
};

export const emptyVariant = (): VariantRow => ({
    size: "",
    stock: "",
});

export const emptyForm: ProductFormState = {
    name: "",
    slug: "",
    description: "",
    brand: "",
    category: "",
    gender: "m",
    basePrice: "",
    isActive: true,
};
