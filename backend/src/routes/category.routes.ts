import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAllCategories);
router.post("/", authorizedMiddleware, adminOnlyMiddleware, categoryController.createCategory);
router.patch("/:id", authorizedMiddleware, adminOnlyMiddleware, categoryController.updateCategory);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, categoryController.deleteCategory);

export default router;
