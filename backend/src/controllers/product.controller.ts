import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "../dtos/product.dto";
import { ProductService } from "../services/product.service";
import { Request, Response } from "express";
import z from "zod";

let productService = new ProductService();

export class ProductController {

    async getAllProducts(req: Request, res: Response) {
        try {
            const parsedQuery = ProductQueryDto.safeParse(req.query);
            if (!parsedQuery.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedQuery.error)
                });
            }
            const result = await productService.getProducts(parsedQuery.data);
            return res.status(200).json({
                success: true,
                data: result.products,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                message: "Products fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getProductBySlug(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const product = await productService.getProductBySlug(slug);
            return res.status(200).json({
                success: true,
                data: product,
                message: "Product fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const parsedData = CreateProductDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const product = await productService.createProduct(parsedData.data);
            return res.status(201).json({
                success: true,
                data: product,
                message: "Product created successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const parsedData = UpdateProductDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const product = await productService.updateProduct(id, parsedData.data);
            return res.status(200).json({
                success: true,
                data: product,
                message: "Product updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await productService.deleteProduct(id);
            return res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
