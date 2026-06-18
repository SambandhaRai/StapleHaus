import { RegisterUserDto, LoginUserDto, VerifyOtpDto, ResendOtpDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();

export class AuthController {

    async register(req: Request, res: Response) {
        try {
            const parsedData = RegisterUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { user } = await userService.registerUser(parsedData.data);
            return res.status(201).json({
                success: true,
                data: user,
                message: "Verification code sent to your email"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.loginUser(parsedData.data);
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const parsedData = VerifyOtpDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.verifyOtp(parsedData.data);
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Email verified successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async resendOtp(req: Request, res: Response) {
        try {
            const parsedData = ResendOtpDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            await userService.resendOtp(parsedData.data);
            return res.status(200).json({
                success: true,
                message: "A new verification code has been sent"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async googleLogin(req: Request, res: Response) {
        try {
            const { credential, nonce } = req.body;
            if (!credential || typeof credential !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Missing Google credential"
                });
            }
            if (!nonce || typeof nonce !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Missing Google sign-in nonce"
                });
            }
            const { token, user } = await userService.loginWithGoogle(credential, nonce);
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async logout(_req: Request, res: Response) {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
}
