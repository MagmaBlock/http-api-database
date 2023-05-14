import { Router } from "express";
import { cdnGetImage } from "../controllers/cdn/api.js";

const router = Router();

router.get("/getimage/*", cdnGetImage);

export default router;
