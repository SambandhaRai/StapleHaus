import { Router } from "express";
import { BrandController } from "../controllers/brand.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const brandController = new BrandController();

router.get("/", brandController.getAllBrands);
router.post("/", authorizedMiddleware, adminOnlyMiddleware, brandController.createBrand);
router.patch("/:id", authorizedMiddleware, adminOnlyMiddleware, brandController.updateBrand);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, brandController.deleteBrand);

export default router;
