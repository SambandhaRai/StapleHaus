import { BrandModel, IBrand } from "../models/brand.model";

type CreateBrandData = {
    name: string;
    slug: string;
    logo?: string;
};

type UpdateBrandData = Partial<CreateBrandData>;

export interface IBrandRepository {
    createBrand(data: CreateBrandData): Promise<IBrand>;
    getAllBrands(): Promise<IBrand[]>;
    getBrandById(id: string): Promise<IBrand | null>;
    getBrandBySlug(slug: string): Promise<IBrand | null>;
    updateOneBrand(id: string, data: UpdateBrandData): Promise<IBrand | null>;
    deleteOneBrand(id: string): Promise<boolean | null>;
}

export class BrandRepository implements IBrandRepository {

    async createBrand(data: CreateBrandData): Promise<IBrand> {
        return await BrandModel.create(data);
    }

    async getAllBrands(): Promise<IBrand[]> {
        return await BrandModel.find().sort({ name: 1 });
    }

    async getBrandById(id: string): Promise<IBrand | null> {
        return await BrandModel.findById(id);
    }

    async getBrandBySlug(slug: string): Promise<IBrand | null> {
        return await BrandModel.findOne({ slug });
    }

    async updateOneBrand(id: string, data: UpdateBrandData): Promise<IBrand | null> {
        return await BrandModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
    }

    async deleteOneBrand(id: string): Promise<boolean | null> {
        const result = await BrandModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}
