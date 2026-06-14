import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const productController = new ProductController();

router.get("/", productController.getAllProducts);
router.get("/:slug", productController.getProductBySlug);

router.post("/", authorizedMiddleware, adminOnlyMiddleware, productController.createProduct);
router.patch("/:id", authorizedMiddleware, adminOnlyMiddleware, productController.updateProduct);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, productController.deleteProduct);

export default router;
