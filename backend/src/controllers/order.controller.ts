import { handleControllerError } from "../errors/handle-controller-error";
import { CheckoutDto, UpdateOrderStatusDto } from "../dtos/order.dto";
import { OrderService } from "../services/order.service";
import { Request, Response } from "express";
import z from "zod";

let orderService = new OrderService();

export class OrderController {

    async checkout(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = CheckoutDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const order = await orderService.checkout(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: order,
                message: "Order placed successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const orders = await orderService.getMyOrders(userId);
            return res.status(200).json({
                success: true,
                data: orders,
                message: "Orders fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async getOrderById(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const orderId = req.params.id as string;
            const order = await orderService.getOrderById(userId, orderId);
            return res.status(200).json({
                success: true,
                data: order,
                message: "Order fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async getAllOrders(_req: Request, res: Response) {
        try {
            const orders = await orderService.getAllOrders();
            return res.status(200).json({
                success: true,
                data: orders,
                message: "Orders fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        try {
            const orderId = req.params.id as string;
            const parsedData = UpdateOrderStatusDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const order = await orderService.updateOrderStatus(orderId, parsedData.data.orderStatus);
            return res.status(200).json({
                success: true,
                data: order,
                message: "Order status updated successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
