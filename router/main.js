import { Router } from 'express';
const router = Router();

import { getAPI, advancedGetAPI } from "../controllers/get.js"
import update from "../controllers/update.js"

router.get('/get/*', getAPI); // 获取
router.post('/get', advancedGetAPI)
router.post('/update', update) // 提交


export default router;