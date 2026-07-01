import { Router } from "express";
import { ActivityController } from "../controllers/activity.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const activityController = new ActivityController();

router.get("/admin/activity-logs", authorizedMiddleware, adminOnlyMiddleware, activityController.getLogs);

export default router;
