import { Router } from 'express';
const router = Router();

import get from "../controllers/get.js"
import update from "../controllers/update.js"

router.get('/get/*', get); // 获取
router.post('/update', update) // 提交


export default router;