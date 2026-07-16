import { Router } from "express";
import { ActivityController } from "../controllers/activity.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const activityController = new ActivityController();

router.get("/admin/activity-logs", authorizedMiddleware, adminOnlyMiddleware, activityController.getLogs);
router.get("/users/me/activity-logs", authorizedMiddleware, activityController.getMyLogs);

export default router;
