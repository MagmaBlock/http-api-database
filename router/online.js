import { Router } from "express";
import { getOnlineUsersAPI } from "../controllers/online/get.js";
import { onlineReportAPI } from "../controllers/online/report.js";
const router = Router();

router.post("/report", onlineReportAPI);
router.get("/get", getOnlineUsersAPI);

export default router;
