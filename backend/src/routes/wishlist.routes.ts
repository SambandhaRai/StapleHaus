import { Router } from "express";
import { WishlistController } from "../controllers/wishlist.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const wishlistController = new WishlistController();

router.get("/", authorizedMiddleware, wishlistController.getWishlist);
router.post("/items", authorizedMiddleware, wishlistController.addItem);
router.delete("/items/:productId", authorizedMiddleware, wishlistController.removeItem);

export default router;
