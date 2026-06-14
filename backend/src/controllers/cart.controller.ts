import { AddCartItemDto, UpdateCartItemDto } from "../dtos/cart.dto";
import { CartService } from "../services/cart.service";
import { Request, Response } from "express";
import z from "zod";

let cartService = new CartService();

export class CartController {

    async getCart(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const cart = await cartService.getCart(userId);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Cart fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async addItem(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = AddCartItemDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const cart = await cartService.addItem(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: cart,
                message: "Item added to cart"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateItem(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const itemId = req.params.itemId as string;
            const parsedData = UpdateCartItemDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const cart = await cartService.updateItem(userId, itemId, parsedData.data.quantity);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Cart item updated"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async removeItem(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const itemId = req.params.itemId as string;
            const cart = await cartService.removeItem(userId, itemId);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Item removed from cart"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
