import { handleControllerError } from "../errors/handle-controller-error";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { CategoryService } from "../services/category.service";
import { Request, Response } from "express";
import z from "zod";

let categoryService = new CategoryService();

export class CategoryController {

    async getAllCategories(_req: Request, res: Response) {
        try {
            const categories = await categoryService.getAllCategories();
            return res.status(200).json({
                success: true,
                data: categories,
                message: "Categories fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async createCategory(req: Request, res: Response) {
        try {
            const parsedData = CreateCategoryDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const category = await categoryService.createCategory(parsedData.data);
            return res.status(201).json({
                success: true,
                data: category,
                message: "Category created successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const parsedData = UpdateCategoryDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const category = await categoryService.updateCategory(id, parsedData.data);
            return res.status(200).json({
                success: true,
                data: category,
                message: "Category updated successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await categoryService.deleteCategory(id);
            return res.status(200).json({
                success: true,
                message: "Category deleted successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
