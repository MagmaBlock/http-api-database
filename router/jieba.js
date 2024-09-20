import { Router } from "express";
import nodejieba from "nodejieba";

const router = Router();

router.post("/extract", (req, res) => {
  const { sentence, threshold } = req.body;
  if (!sentence || !threshold) {
    return res.status(400).json({ error: "缺少必要参数" });
  }

  const result = nodejieba.extract(sentence, threshold);
  res.json(result);
});

export default router;
