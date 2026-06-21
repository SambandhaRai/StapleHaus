import { CategoryModel, ICategory } from "../models/category.model";

type CreateCategoryData = {
    name: string;
    slug: string;
};

type UpdateCategoryData = Partial<CreateCategoryData>;

export interface ICategoryRepository {
    createCategory(data: CreateCategoryData): Promise<ICategory>;
    getAllCategories(): Promise<ICategory[]>;
    getCategoryById(id: string): Promise<ICategory | null>;
    getCategoryBySlug(slug: string): Promise<ICategory | null>;
    updateOneCategory(id: string, data: UpdateCategoryData): Promise<ICategory | null>;
    deleteOneCategory(id: string): Promise<boolean | null>;
}

export class CategoryRepository implements ICategoryRepository {

    async createCategory(data: CreateCategoryData): Promise<ICategory> {
        return await CategoryModel.create(data);
    }

    async getAllCategories(): Promise<ICategory[]> {
        return await CategoryModel.find().sort({ name: 1 });
    }

    async getCategoryById(id: string): Promise<ICategory | null> {
        return await CategoryModel.findById(id);
    }

    async getCategoryBySlug(slug: string): Promise<ICategory | null> {
        return await CategoryModel.findOne({ slug });
    }

    async updateOneCategory(id: string, data: UpdateCategoryData): Promise<ICategory | null> {
        return await CategoryModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
    }

    async deleteOneCategory(id: string): Promise<boolean | null> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
