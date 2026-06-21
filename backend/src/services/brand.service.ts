import { BrandRepository } from "../repositories/brand.repository";
import { CreateBrandDto, UpdateBrandDto } from "../dtos/brand.dto";
import { HttpError } from "../errors/http-error";
import { slugify } from "../utils/slugify";
import mongoose from "mongoose";

let brandRepository = new BrandRepository();

export class BrandService {

    async createBrand(data: CreateBrandDto) {
        const slug = slugify(data.slug || data.name);

        const existing = await brandRepository.getBrandBySlug(slug);
        if (existing) {
            throw new HttpError(409, "A brand with this slug already exists");
        }

        return await brandRepository.createBrand({
            name: data.name,
            slug,
            logo: data.logo,
        });
    }

    async getAllBrands() {
        return await brandRepository.getAllBrands();
    }

    async getBrandById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid brand ID");
        }
        const brand = await brandRepository.getBrandById(id);
        if (!brand) {
            throw new HttpError(404, "Brand not found");
        }
        return brand;
    }

    async updateBrand(id: string, data: UpdateBrandDto) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid brand ID");
        }

        const updateData: { name?: string; slug?: string; logo?: string } = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.logo !== undefined) updateData.logo = data.logo;
        if (data.slug !== undefined || data.name !== undefined) {
            const slug = slugify(data.slug || data.name || "");
            if (slug) {
                const existing = await brandRepository.getBrandBySlug(slug);
                if (existing && existing._id.toString() !== id) {
                    throw new HttpError(409, "A brand with this slug already exists");
                }
                updateData.slug = slug;
            }
        }

        const updated = await brandRepository.updateOneBrand(id, updateData);
        if (!updated) {
            throw new HttpError(404, "Brand not found");
        }
        return updated;
    }

    async deleteBrand(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid brand ID");
        }
        const deleted = await brandRepository.deleteOneBrand(id);
        if (!deleted) {
            throw new HttpError(404, "Brand not found");
        }
        return deleted;
    }
}
