import { Router } from "express";
import {
  downloadFileAPI,
  uploadFileAPI,
} from "../controllers/tempFile/main.js";
import { requireAppUA } from "../src/utils/ua.js";
const router = Router();

router.post("/upload", [requireAppUA, uploadFileAPI]);
router.get("/download/:key", downloadFileAPI);

export default router;
