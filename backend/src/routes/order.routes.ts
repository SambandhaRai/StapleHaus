import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const orderController = new OrderController();

router.post("/orders", authorizedMiddleware, orderController.checkout);
router.get("/orders", authorizedMiddleware, orderController.getMyOrders);
router.get("/orders/:id", authorizedMiddleware, orderController.getOrderById);

router.get("/admin/orders", authorizedMiddleware, adminOnlyMiddleware, orderController.getAllOrders);
router.patch("/admin/orders/:id/status", authorizedMiddleware, adminOnlyMiddleware, orderController.updateOrderStatus);

export default router;
