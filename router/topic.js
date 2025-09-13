import { Router } from "express";
import { doSearchAPI } from "../controllers/topic/searchTopic.js";
import { updateTopicAPI } from "../controllers/topic/updateTopic.js";
import { requireAppUA } from "../src/utils/ua.js";
const router = Router();

router.post("/search", doSearchAPI);
router.post("/update", [requireAppUA, updateTopicAPI]);

export default router;
