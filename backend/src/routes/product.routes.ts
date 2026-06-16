import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const productController = new ProductController();

router.get("/", productController.getAllProducts);
router.get("/:slug", productController.getProductBySlug);

router.post(
    "/",
    authorizedMiddleware,
    adminOnlyMiddleware,
    uploads.array("images", 8),
    productController.createProduct
);
router.patch(
    "/:id",
    authorizedMiddleware,
    adminOnlyMiddleware,
    uploads.array("images", 8),
    productController.updateProduct
);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, productController.deleteProduct);

export default router;
