import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { reviewWriteLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();
const reviewController = new ReviewController();

router.get("/products/:productId/reviews", reviewController.getProductReviews);
router.post("/products/:productId/reviews", authorizedMiddleware, reviewWriteLimiter, reviewController.createReview);
router.delete("/reviews/:id", authorizedMiddleware, reviewController.deleteReview);

export default router;
