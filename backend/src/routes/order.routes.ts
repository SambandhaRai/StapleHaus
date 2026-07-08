import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";
import { checkoutLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();
const orderController = new OrderController();

router.post("/orders", authorizedMiddleware, checkoutLimiter, orderController.checkout);
router.post("/orders/verify-payment", authorizedMiddleware, orderController.verifyPayment);
router.get("/orders", authorizedMiddleware, orderController.getMyOrders);
router.get("/orders/:id", authorizedMiddleware, orderController.getOrderById);

router.get("/admin/orders", authorizedMiddleware, adminOnlyMiddleware, orderController.getAllOrders);
router.patch("/admin/orders/:id/status", authorizedMiddleware, adminOnlyMiddleware, orderController.updateOrderStatus);

export default router;
