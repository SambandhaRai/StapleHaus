export type CategoryRecord = {
    _id: string;
    name?: string;
    slug?: string;
};

export type CategoryFormState = {
    name: string;
    slug: string;
};

export const emptyCategoryForm: CategoryFormState = {
    name: "",
    slug: "",
};
