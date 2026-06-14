import { AddWishlistItemDto } from "../dtos/wishlist.dto";
import { WishlistService } from "../services/wishlist.service";
import { Request, Response } from "express";
import z from "zod";

let wishlistService = new WishlistService();

export class WishlistController {

    async getWishlist(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const wishlist = await wishlistService.getWishlist(userId);
            return res.status(200).json({
                success: true,
                data: wishlist,
                message: "Wishlist fetched successfully"
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
            const parsedData = AddWishlistItemDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const wishlist = await wishlistService.addItem(userId, parsedData.data.productId);
            return res.status(201).json({
                success: true,
                data: wishlist,
                message: "Product added to wishlist"
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
            const productId = req.params.productId as string;
            const wishlist = await wishlistService.removeItem(userId, productId);
            return res.status(200).json({
                success: true,
                data: wishlist,
                message: "Product removed from wishlist"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
