import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
    loginLimiter,
    registerLimiter,
    verifyOtpLimiter,
    resendOtpLimiter,
    googleLimiter,
} from "../middlewares/rate-limit.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", registerLimiter, authController.register);
router.post("/verify-otp", verifyOtpLimiter, authController.verifyOtp);
router.post("/resend-otp", resendOtpLimiter, authController.resendOtp);
router.post("/login", loginLimiter, authController.login);
router.post("/google", googleLimiter, authController.googleLogin);
router.post("/logout", authController.logout);

export default router;
