import { Router } from "express";
import { IpAccessController } from "../controllers/ip-access.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const ipAccessController = new IpAccessController();

router.get("/admin/ip-access", authorizedMiddleware, adminOnlyMiddleware, ipAccessController.getEntries);
router.post("/admin/ip-access", authorizedMiddleware, adminOnlyMiddleware, ipAccessController.createEntry);
router.delete("/admin/ip-access/:id", authorizedMiddleware, adminOnlyMiddleware, ipAccessController.deleteEntry);

export default router;
