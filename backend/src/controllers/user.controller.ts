import { handleControllerError } from "../errors/handle-controller-error";
import { UpdateUserDto, CreateAddressDto, UpdateAddressDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();

export class UserController {

    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json({
                success: true,
                data: user,
                message: "Profile fetched successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Profile updated successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async addAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = CreateAddressDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedUser = await userService.addAddress(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: updatedUser,
                message: "Address added successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async updateAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const addressId = req.params.addressId as string;
            const parsedData = UpdateAddressDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedUser = await userService.updateAddress(userId, addressId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Address updated successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async deleteAddress(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const addressId = req.params.addressId as string;
            const updatedUser = await userService.deleteAddress(userId, addressId);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Address removed successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }
}
