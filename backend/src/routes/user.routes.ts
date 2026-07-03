import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { SessionController } from "../controllers/session.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const userController = new UserController();
const sessionController = new SessionController();

router.get("/me", authorizedMiddleware, userController.getProfile);
router.patch("/me", authorizedMiddleware, userController.updateProfile);
router.post("/me/password", authorizedMiddleware, userController.changePassword);

router.post("/me/addresses", authorizedMiddleware, userController.addAddress);
router.patch("/me/addresses/:addressId", authorizedMiddleware, userController.updateAddress);
router.delete("/me/addresses/:addressId", authorizedMiddleware, userController.deleteAddress);

router.post("/me/2fa/setup", authorizedMiddleware, userController.setupTwoFactor);
router.post("/me/2fa/enable", authorizedMiddleware, userController.enableTwoFactor);
router.post("/me/2fa/disable", authorizedMiddleware, userController.disableTwoFactor);

router.get("/me/sessions", authorizedMiddleware, sessionController.listSessions);
router.delete("/me/sessions", authorizedMiddleware, sessionController.revokeOtherSessions);
router.delete("/me/sessions/:id", authorizedMiddleware, sessionController.revokeSession);

export default router;
