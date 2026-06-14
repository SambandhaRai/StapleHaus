import { CreateBrandDto, UpdateBrandDto } from "../dtos/brand.dto";
import { BrandService } from "../services/brand.service";
import { Request, Response } from "express";
import z from "zod";

let brandService = new BrandService();

export class BrandController {

    async getAllBrands(_req: Request, res: Response) {
        try {
            const brands = await brandService.getAllBrands();
            return res.status(200).json({
                success: true,
                data: brands,
                message: "Brands fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async createBrand(req: Request, res: Response) {
        try {
            const parsedData = CreateBrandDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const brand = await brandService.createBrand(parsedData.data);
            return res.status(201).json({
                success: true,
                data: brand,
                message: "Brand created successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateBrand(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const parsedData = UpdateBrandDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const brand = await brandService.updateBrand(id, parsedData.data);
            return res.status(200).json({
                success: true,
                data: brand,
                message: "Brand updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteBrand(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await brandService.deleteBrand(id);
            return res.status(200).json({
                success: true,
                message: "Brand deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
