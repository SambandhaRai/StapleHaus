import { Router } from "express";
import { DiscountController } from "../controllers/discount.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const discountController = new DiscountController();

router.post("/discounts/validate", authorizedMiddleware, discountController.validate);

router.get("/admin/discounts", authorizedMiddleware, adminOnlyMiddleware, discountController.getAllDiscounts);
router.post("/admin/discounts", authorizedMiddleware, adminOnlyMiddleware, discountController.createDiscount);
router.patch("/admin/discounts/:id", authorizedMiddleware, adminOnlyMiddleware, discountController.updateDiscount);
router.delete("/admin/discounts/:id", authorizedMiddleware, adminOnlyMiddleware, discountController.deleteDiscount);

export default router;
