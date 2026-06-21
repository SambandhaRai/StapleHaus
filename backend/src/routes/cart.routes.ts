import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const cartController = new CartController();

router.get("/", authorizedMiddleware, cartController.getCart);
router.post("/items", authorizedMiddleware, cartController.addItem);
router.patch("/items/:itemId", authorizedMiddleware, cartController.updateItem);
router.delete("/items/:itemId", authorizedMiddleware, cartController.removeItem);

export default router;
