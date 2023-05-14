import { Router } from "express";
import { doSearchAPI } from "../controllers/topic/searchTopic.js";
import { updateTopicAPI } from "../controllers/topic/updateTopic.js";
const router = Router();

router.post("/search", doSearchAPI);
router.post("/update", updateTopicAPI);

export default router;
