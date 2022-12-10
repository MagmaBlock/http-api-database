import { Router } from "express";
import { downloadFileAPI, uploadFileAPI } from "../controllers/tempFile/main.js";
const router = Router()

router.post('/upload', uploadFileAPI)
router.get('/download/:key', downloadFileAPI)

export default router;

