import { trusted } from "mongoose";
import { ProductModel, IProduct } from "../models/product.model";
import { BrandModel } from "../models/brand.model";
import { ProductQueryDto } from "../dtos/product.dto";
import { GenderType } from "../types/product.type";

type CreateProductData = {
    name: string;
    slug: string;
    description: string;
    brand: string;
    gender: GenderType;
    category: string;
    basePrice: number;
    images: string[];
    variants: {
        size: string;
        color: string;
        sku: string;
        stock: number;
        priceOverride?: number;
    }[];
    isActive: boolean;
};

type UpdateProductData = Partial<CreateProductData>;

export interface IProductRepository {
    createProduct(data: CreateProductData): Promise<IProduct>;
    getProducts(query: ProductQueryDto): Promise<{ products: IProduct[]; total: number }>;
    getProductById(id: string): Promise<IProduct | null>;
    getProductBySlug(slug: string): Promise<IProduct | null>;
    updateOneProduct(id: string, data: UpdateProductData): Promise<IProduct | null>;
    deleteOneProduct(id: string): Promise<boolean | null>;
    decreaseStock(productId: string, sku: string, quantity: number): Promise<IProduct | null>;
    increaseStock(productId: string, sku: string, quantity: number): Promise<IProduct | null>;
    setRatingStats(productId: string, avgRating: number, reviewCount: number): Promise<IProduct | null>;
}

export class ProductRepository implements IProductRepository {

    async createProduct(data: CreateProductData): Promise<IProduct> {
        return await ProductModel.create(data);
    }

    async getProducts(query: ProductQueryDto): Promise<{ products: IProduct[]; total: number }> {
        const { gender, category, brand, size, color, minPrice, maxPrice, q, sort, page, limit } = query;

        const filter: Record<string, any> = { isActive: true };
        if (gender) filter.gender = gender;
        if (category) filter.category = category;
        if (brand) {
            const brandIds = brand.split(",").map((b) => b.trim()).filter(Boolean);
            if (brandIds.length > 1) filter.brand = trusted({ $in: brandIds });
            else if (brandIds.length === 1) filter.brand = brandIds[0];
        }
        if (size) {
            const sizes = size.split(",").map((s) => s.trim()).filter(Boolean);
            if (sizes.length > 1) filter["variants.size"] = trusted({ $in: sizes });
            else if (sizes.length === 1) filter["variants.size"] = sizes[0];
        }
        if (color) filter["variants.color"] = color;
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter: Record<string, number> = {};
            if (minPrice !== undefined) priceFilter.$gte = minPrice;
            if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
            filter.basePrice = trusted(priceFilter);
        }
        if (q) {
            // Escapes regex metacharacters in user-supplied search text before it's
            // built into a MongoDB regex query. Without this, a query like ".*" or
            // a crafted pattern could be used for a denial-of-service (catastrophic
            // backtracking) or to widen the search into an unintended match.
            const term = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(term, "i");
            const matchingBrands = await BrandModel.find({ name: regex }).select("_id");
            const matchingBrandIds = matchingBrands.map((b) => b._id);
            filter.$or = [
                { name: regex },
                ...(matchingBrandIds.length > 0 ? [{ brand: trusted({ $in: matchingBrandIds }) }] : []),
            ];
        }

        let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
        if (sort === "price_asc") sortObj = { basePrice: 1 };
        else if (sort === "price_desc") sortObj = { basePrice: -1 };
        else if (sort === "rating") sortObj = { avgRating: -1 };

        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .populate("brand", "name slug")
                .populate("category", "name slug")
                .sort(sortObj)
                .skip((page - 1) * limit)
                .limit(limit),
            ProductModel.countDocuments(filter),
        ]);

        return { products, total };
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await ProductModel.findById(id)
            .populate("brand", "name slug")
            .populate("category", "name slug");
    }

    async getProductBySlug(slug: string): Promise<IProduct | null> {
        return await ProductModel.findOne({ slug })
            .populate("brand", "name slug")
            .populate("category", "name slug");
    }

    async updateOneProduct(id: string, data: UpdateProductData): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(id, data, { returnDocument: "after" })
            .populate("brand", "name slug")
            .populate("category", "name slug");
    }

    async deleteOneProduct(id: string): Promise<boolean | null> {
        const result = await ProductModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async decreaseStock(productId: string, sku: string, quantity: number): Promise<IProduct | null> {
        return await ProductModel.findOneAndUpdate(
            { _id: productId, "variants.sku": sku, "variants.stock": trusted({ $gte: quantity }) },
            { $inc: { "variants.$.stock": -quantity } },
            { returnDocument: "after" }
        );
    }

    async increaseStock(productId: string, sku: string, quantity: number): Promise<IProduct | null> {
        return await ProductModel.findOneAndUpdate(
            { _id: productId, "variants.sku": sku },
            { $inc: { "variants.$.stock": quantity } },
            { returnDocument: "after" }
        );
    }

    async setRatingStats(productId: string, avgRating: number, reviewCount: number): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(
            productId,
            { $set: { avgRating, reviewCount } },
            { returnDocument: "after" }
        );
    }
}
