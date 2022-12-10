import { Router } from 'express';
const router = Router();

import { getKeyAPI, advancedGetAPI } from "../controllers/get.js"
import updateKeyAPI from '../controllers/update.js';

router.get('/get/*', getKeyAPI); // 获取
router.post('/get', advancedGetAPI)
router.post('/update', updateKeyAPI) // 提交


export default router;