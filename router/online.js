import { Router } from "express";
import { getOnlineUsersAPI } from "../controllers/online/get.js";
import { onlineReportAPI } from "../controllers/online/report.js";
import { requireAppUA } from "../middleware/ua.js";
const router = Router();

router.post("/report", [requireAppUA, onlineReportAPI]);
router.get("/get", getOnlineUsersAPI);

export default router;
