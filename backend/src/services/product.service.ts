import { ProductRepository } from "../repositories/product.repository";
import { BrandRepository } from "../repositories/brand.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "../dtos/product.dto";
import { HttpError } from "../errors/http-error";
import { slugify } from "../utils/slugify";
import mongoose from "mongoose";

let productRepository = new ProductRepository();
let brandRepository = new BrandRepository();
let categoryRepository = new CategoryRepository();

export class ProductService {

    private async assertBrandExists(brandId: string) {
        if (!mongoose.Types.ObjectId.isValid(brandId)) {
            throw new HttpError(400, "Invalid brand ID");
        }
        const brand = await brandRepository.getBrandById(brandId);
        if (!brand) {
            throw new HttpError(404, "Brand not found");
        }
    }

    private async assertCategoryExists(categoryId: string) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new HttpError(400, "Invalid category ID");
        }
        const category = await categoryRepository.getCategoryById(categoryId);
        if (!category) {
            throw new HttpError(404, "Category not found");
        }
    }

    private assertUniqueSkus(variants: { sku: string }[]) {
        const skus = variants.map(v => v.sku);
        const unique = new Set(skus);
        if (unique.size !== skus.length) {
            throw new HttpError(400, "Variant SKUs must be unique within a product");
        }
    }

    private handleDuplicateKey(error: any): never {
        if (error?.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "";
            if (field.includes("sku")) {
                throw new HttpError(409, "A product with this SKU already exists");
            }
            throw new HttpError(409, "A product with this slug already exists");
        }
        throw error;
    }

    async createProduct(data: CreateProductDto) {
        await this.assertBrandExists(data.brand);
        await this.assertCategoryExists(data.category);
        this.assertUniqueSkus(data.variants);

        const slug = slugify(data.slug || data.name);
        const existing = await productRepository.getProductBySlug(slug);
        if (existing) {
            throw new HttpError(409, "A product with this slug already exists");
        }

        try {
            return await productRepository.createProduct({
                name: data.name,
                slug,
                description: data.description,
                brand: data.brand,
                gender: data.gender,
                category: data.category,
                basePrice: data.basePrice,
                images: data.images,
                variants: data.variants,
                isActive: data.isActive,
            });
        } catch (error: any) {
            this.handleDuplicateKey(error);
        }
    }

    async getProducts(query: ProductQueryDto) {
        const { products, total } = await productRepository.getProducts(query);
        return {
            products,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }

    async getProductBySlug(slug: string) {
        const product = await productRepository.getProductBySlug(slug);
        if (!product) {
            throw new HttpError(404, "Product not found");
        }
        return product;
    }

    async getProductById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid product ID");
        }
        const product = await productRepository.getProductById(id);
        if (!product) {
            throw new HttpError(404, "Product not found");
        }
        return product;
    }

    async updateProduct(id: string, data: UpdateProductDto) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid product ID");
        }

        if (data.brand !== undefined) await this.assertBrandExists(data.brand);
        if (data.category !== undefined) await this.assertCategoryExists(data.category);
        if (data.variants !== undefined) this.assertUniqueSkus(data.variants);

        const updateData: Record<string, unknown> = { ...data };
        delete updateData.slug;

        if (data.slug !== undefined || data.name !== undefined) {
            const slug = slugify(data.slug || data.name || "");
            if (slug) {
                const existing = await productRepository.getProductBySlug(slug);
                if (existing && existing._id.toString() !== id) {
                    throw new HttpError(409, "A product with this slug already exists");
                }
                updateData.slug = slug;
            }
        }

        try {
            const updated = await productRepository.updateOneProduct(id, updateData);
            if (!updated) {
                throw new HttpError(404, "Product not found");
            }
            return updated;
        } catch (error: any) {
            if (error instanceof HttpError) throw error;
            this.handleDuplicateKey(error);
        }
    }

    async deleteProduct(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpError(400, "Invalid product ID");
        }
        const deleted = await productRepository.deleteOneProduct(id);
        if (!deleted) {
            throw new HttpError(404, "Product not found");
        }
        return deleted;
    }
}
