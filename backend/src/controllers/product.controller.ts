import { handleControllerError } from "../errors/handle-controller-error";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "../dtos/product.dto";
import { ProductService } from "../services/product.service";
import { Request, Response } from "express";
import z from "zod";

let productService = new ProductService();

function getProductBody(req: Request) {
    if (!req.body?.payload) {
        return { data: req.body };
    }

    if (typeof req.body.payload !== "string") {
        return { error: "Invalid product payload" };
    }

    try {
        return { data: JSON.parse(req.body.payload) };
    } catch {
        return { error: "Invalid product payload" };
    }
}

function getUploadedImageNames(req: Request) {
    const files = req.files as Express.Multer.File[] | undefined;
    return (files || []).map((file) => file.filename);
}

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
            return handleControllerError(res, error);
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
            return handleControllerError(res, error);
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const body = getProductBody(req);
            if (body.error) {
                return res.status(400).json({ success: false, message: body.error });
            }

            const parsedData = CreateProductDto.safeParse(body.data);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const product = await productService.createProduct(
                parsedData.data,
                getUploadedImageNames(req)
            );
            return res.status(201).json({
                success: true,
                data: product,
                message: "Product created successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const body = getProductBody(req);
            if (body.error) {
                return res.status(400).json({ success: false, message: body.error });
            }

            const parsedData = UpdateProductDto.safeParse(body.data);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const product = await productService.updateProduct(
                id,
                parsedData.data,
                getUploadedImageNames(req)
            );
            return res.status(200).json({
                success: true,
                data: product,
                message: "Product updated successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
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
            return handleControllerError(res, error);
        }
    }
}
