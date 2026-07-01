import { handleControllerError } from "../errors/handle-controller-error";
import { RegisterUserDto, LoginUserDto, VerifyOtpDto, ResendOtpDto, LoginTwoFactorDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { ActivityLogService } from "../services/activity-log.service";
import { getRequestContext } from "../utils/request-context";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();
let activityLogService = new ActivityLogService();

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
            const { user } = await userService.registerUser(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                data: user,
                message: "If this email needs verification, a code will be sent"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
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
            const result = await userService.loginUser(parsedData.data, getRequestContext(req));
            if (result.twoFactorRequired) {
                return res.status(200).json({
                    success: true,
                    twoFactorRequired: true,
                    challengeToken: result.challengeToken,
                    message: "Enter your authentication code"
                });
            }
            return res.status(200).json({
                success: true,
                data: result.user,
                token: result.token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async loginTwoFactor(req: Request, res: Response) {
        try {
            const parsedData = LoginTwoFactorDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.loginWithTwoFactor(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
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
            const { token, user } = await userService.verifyOtp(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Email verified successfully"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
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
            await userService.resendOtp(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                message: "If this email needs verification, a new code will be sent"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
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
            const { token, user } = await userService.loginWithGoogle(credential, nonce, getRequestContext(req));
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async logout(req: Request, res: Response) {
        if (req.user) {
            await activityLogService.record({
                ...getRequestContext(req),
                action: "logout",
                status: "success",
                userId: req.user.id,
                email: req.user.email,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
}
