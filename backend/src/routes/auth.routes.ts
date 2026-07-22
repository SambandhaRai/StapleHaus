import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
    loginLimiter,
    registerLimiter,
    verifyOtpLimiter,
    resendOtpLimiter,
    googleLimiter,
    twoFactorLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    expiredPasswordLimiter,
} from "../middlewares/rate-limit.middleware";
import { verifyCaptcha } from "../middlewares/captcha.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", registerLimiter, verifyCaptcha, authController.register);
router.post("/verify-otp", verifyOtpLimiter, authController.verifyOtp);
router.post("/resend-otp", resendOtpLimiter, verifyCaptcha, authController.resendOtp);
router.post("/login", loginLimiter, verifyCaptcha, authController.login);
router.post("/login/2fa", twoFactorLimiter, authController.loginTwoFactor);
router.post("/login/password-expired", expiredPasswordLimiter, authController.changeExpiredPassword);
router.post("/forgot-password", forgotPasswordLimiter, verifyCaptcha, authController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, authController.resetPassword);
router.get("/google/start", googleLimiter, authController.googleStart);
router.post("/google/callback", googleLimiter, authController.googleCallback);
router.post("/logout", authorizedMiddleware, authController.logout);

export default router;
