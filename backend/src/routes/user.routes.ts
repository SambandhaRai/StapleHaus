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

export default router;
