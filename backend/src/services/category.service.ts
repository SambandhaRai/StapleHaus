import { CategoryRepository } from "../repositories/category.repository";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { HttpError } from "../errors/http-error";
import { slugify } from "../utils/slugify";
import mongoose from "mongoose";

let categoryRepository = new CategoryRepository();

export class CategoryService {

    async createCategory(data: CreateCategoryDto) {
        const slug = slugify(data.slug || data.name);

        const existing = await categoryRepository.getCategoryBySlug(slug);
        if (existing) {
            throw new HttpError(409, "A category with this slug already exists");
        }

        return await categoryRepository.createCategory({ name: data.name, slug });
    }

    async getAllCategories() {
        return await categoryRepository.getAllCategories();
    }

    async getCategoryById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid category ID");
        }
        const category = await categoryRepository.getCategoryById(id);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }
        return category;
    }

    async updateCategory(id: string, data: UpdateCategoryDto) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid category ID");
        }

        const updateData: { name?: string; slug?: string } = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined || data.name !== undefined) {
            const slug = slugify(data.slug || data.name || "");
            if (slug) {
                const existing = await categoryRepository.getCategoryBySlug(slug);
                if (existing && existing._id.toString() !== id) {
                    throw new HttpError(409, "A category with this slug already exists");
                }
                updateData.slug = slug;
            }
        }

        const updated = await categoryRepository.updateOneCategory(id, updateData);
        if (!updated) {
            throw new HttpError(404, "Category not found");
        }
        return updated;
    }

    async deleteCategory(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid category ID");
        }
        const deleted = await categoryRepository.deleteOneCategory(id);
        if (!deleted) {
            throw new HttpError(404, "Category not found");
        }
        return deleted;
    }
}
