import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const userController = new UserController();

router.get("/me", authorizedMiddleware, userController.getProfile);
router.patch("/me", authorizedMiddleware, userController.updateProfile);

router.post("/me/addresses", authorizedMiddleware, userController.addAddress);
router.patch("/me/addresses/:addressId", authorizedMiddleware, userController.updateAddress);
router.delete("/me/addresses/:addressId", authorizedMiddleware, userController.deleteAddress);

router.post("/me/2fa/setup", authorizedMiddleware, userController.setupTwoFactor);
router.post("/me/2fa/enable", authorizedMiddleware, userController.enableTwoFactor);
router.post("/me/2fa/disable", authorizedMiddleware, userController.disableTwoFactor);

export default router;
