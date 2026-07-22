import { handleControllerError } from "../errors/handle-controller-error";
import { RegisterUserDto, LoginUserDto, VerifyOtpDto, ResendOtpDto, LoginTwoFactorDto, ChangeExpiredPasswordDto, ForgotPasswordDto, ResetPasswordDto, GoogleCallbackDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { ActivityLogService } from "../services/activity-log.service";
import { SessionService } from "../services/session.service";
import { GoogleService } from "../services/google.service";
import { getRequestContext } from "../utils/request-context";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();
let activityLogService = new ActivityLogService();
let sessionService = new SessionService();
let googleService = new GoogleService();

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
            if (result.passwordExpired) {
                return res.status(200).json({
                    success: true,
                    passwordExpired: true,
                    expiredToken: result.expiredToken,
                    message: "Your password has expired. Please set a new one."
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
            const result = await userService.loginWithTwoFactor(parsedData.data, getRequestContext(req));
            if (result.passwordExpired) {
                return res.status(200).json({
                    success: true,
                    passwordExpired: true,
                    expiredToken: result.expiredToken,
                    message: "Your password has expired. Please set a new one."
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

    async changeExpiredPassword(req: Request, res: Response) {
        try {
            const parsedData = ChangeExpiredPasswordDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.changeExpiredPassword(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Password updated successfully"
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

    async googleStart(req: Request, res: Response) {
        try {
            if (!googleService.isConfigured()) {
                return res.status(503).json({
                    success: false,
                    message: "Google sign-in is not configured on this server"
                });
            }
            const state = googleService.createStateToken();
            return res.status(200).json({
                success: true,
                data: {
                    url: googleService.getAuthUrl(state),
                    state
                },
                message: "Google sign-in started"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async googleCallback(req: Request, res: Response) {
        const context = getRequestContext(req);
        try {
            if (!googleService.isConfigured()) {
                return res.status(503).json({
                    success: false,
                    message: "Google sign-in is not configured on this server"
                });
            }

            const parsedData = GoogleCallbackDto.safeParse(req.body);
            if (!parsedData.success) {
                await activityLogService.record({
                    ...context,
                    action: "google_login_failed",
                    status: "failure",
                    reason: "invalid_callback",
                });
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }

            const { code, state, stateCookie } = parsedData.data;

            if (state !== stateCookie) {
                await activityLogService.record({
                    ...context,
                    action: "google_login_failed",
                    status: "failure",
                    reason: "state_mismatch",
                });
                return res.status(400).json({
                    success: false,
                    message: "Google sign-in could not be verified, please try again"
                });
            }

            googleService.verifyStateToken(stateCookie);

            const identity = await googleService.exchangeCode(code);
            const result = await userService.loginWithGoogle(identity, context);

            if (result.twoFactorRequired) {
                return res.status(200).json({
                    success: true,
                    twoFactorRequired: true,
                    challengeToken: result.challengeToken,
                    message: "Enter your authentication code"
                });
            }
            if (result.passwordExpired) {
                return res.status(200).json({
                    success: true,
                    passwordExpired: true,
                    expiredToken: result.expiredToken,
                    message: "Your password has expired. Please set a new one."
                });
            }
            return res.status(200).json({
                success: true,
                data: result.user,
                token: result.token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            await activityLogService.record({
                ...context,
                action: "google_login_failed",
                status: "failure",
                reason: `error_${error.statusCode || 500}`,
            });
            return handleControllerError(res, error);
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const parsedData = ForgotPasswordDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            await userService.requestPasswordReset(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                message: "If an account exists for that email, a reset link has been sent"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsedData = ResetPasswordDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            await userService.resetPassword(parsedData.data, getRequestContext(req));
            return res.status(200).json({
                success: true,
                message: "Password reset successfully. You can now sign in with your new password"
            });
        } catch (error: Error | any) {
            return handleControllerError(res, error);
        }
    }

    async logout(req: Request, res: Response) {
        if (req.user) {
            if (req.user.sessionId) {
                await sessionService.revokeSession(req.user.sessionId);
            }
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
