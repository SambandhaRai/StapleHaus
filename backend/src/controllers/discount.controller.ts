import { handleControllerError } from "../errors/handle-controller-error";
import { CreateDiscountDto, UpdateDiscountDto, ValidateDiscountDto } from "../dtos/discount.dto";
import { DiscountService } from "../services/discount.service";
import { Request, Response } from "express";
import z from "zod";

let discountService = new DiscountService();

export class DiscountController {
    async validate(req: Request, res: Response) {
        try {
            const parsedData = ValidateDiscountDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const result = await discountService.validateDiscount(parsedData.data);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Discount is valid"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async getAllDiscounts(_req: Request, res: Response) {
        try {
            const discounts = await discountService.getAllDiscounts();
            return res.status(200).json({
                success: true,
                data: discounts,
                message: "Discounts fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async createDiscount(req: Request, res: Response) {
        try {
            const parsedData = CreateDiscountDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const discount = await discountService.createDiscount(parsedData.data);
            return res.status(201).json({
                success: true,
                data: discount,
                message: "Discount created successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async updateDiscount(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const parsedData = UpdateDiscountDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const discount = await discountService.updateDiscount(id, parsedData.data);
            return res.status(200).json({
                success: true,
                data: discount,
                message: "Discount updated successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async deleteDiscount(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await discountService.deleteDiscount(id);
            return res.status(200).json({
                success: true,
                message: "Discount deleted successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
