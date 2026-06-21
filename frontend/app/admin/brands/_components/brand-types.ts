export type BrandRecord = {
    _id: string;
    name?: string;
    slug?: string;
    logo?: string;
};

export type BrandFormState = {
    name: string;
    slug: string;
    logo: string;
};

export const emptyBrandForm: BrandFormState = {
    name: "",
    slug: "",
    logo: "",
};
