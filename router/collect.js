import { Router } from "express";
import {
  collectAPI,
  getUserCollectAPI,
} from "../controllers/collect/collect.js";
import { collectRankAPI } from "../controllers/collect/collectRank.js";
import { isCollectedAPI } from "../controllers/collect/isCollected.js";
const router = Router();

router.get("/user/is", isCollectedAPI);
router.get("/user/list", getUserCollectAPI);
router.post("/user/update", collectAPI);
router.post("/rank", collectRankAPI);

export default router;
