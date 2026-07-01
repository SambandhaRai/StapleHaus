import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
    loginLimiter,
    registerLimiter,
    verifyOtpLimiter,
    resendOtpLimiter,
    googleLimiter,
    twoFactorLimiter,
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
router.post("/google", googleLimiter, authController.googleLogin);
router.post("/logout", authorizedMiddleware, authController.logout);

export default router;
