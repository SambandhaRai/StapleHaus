import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
    loginLimiter,
    registerLimiter,
    verifyOtpLimiter,
    resendOtpLimiter,
    googleLimiter,
} from "../middlewares/rate-limit.middleware";
import { verifyCaptcha } from "../middlewares/captcha.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", registerLimiter, verifyCaptcha, authController.register);
router.post("/verify-otp", verifyOtpLimiter, authController.verifyOtp);
router.post("/resend-otp", resendOtpLimiter, verifyCaptcha, authController.resendOtp);
router.post("/login", loginLimiter, verifyCaptcha, authController.login);
router.post("/google", googleLimiter, authController.googleLogin);
router.post("/logout", authController.logout);

export default router;
