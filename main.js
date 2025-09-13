import express from "express";
import cron from "node-cron";

import logger from "./controllers/log/logger.js";
import { clearOldLogs } from "./controllers/log/logCleaner.js";
import config from "./common/config.js";
import { encryptResponseBody } from "./middleware/encrypt.js";

const app = express(); // Express app
app.use(
  express.json({
    // use JSON body
    limit: "4mb",
  })
);
app.set("trust proxy", config.reverseProxy); // 允许 Express 信任上级代理提供的 IP 地址

app.all("/*", async (req, res, next) => {
  res.header("Content-Type", "application/json"); // 指定客户端请求的属性
  res.header("Access-Control-Allow-Origin", "*"); // 允许跨域
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  next();
});

app.use(encryptResponseBody);

import main from "./router/main.js"; // main router
import online from "./router/online.js"; // 在线量
import collect from "./router/collect.js"; // 帖子收藏
import temp from "./router/temp.js"; // 临时文件直链
import topic from "./router/topic.js"; // 小组帖子相关
import jieba from "./router/jieba.js"; // 结巴分词
app.use("/v1", main);
app.use("/v1/online", online);
app.use("/v1/collect", collect);
app.use("/v1/temp", temp);
app.use("/v1/topic", topic);
app.use("/v1/jieba", jieba);

app.get("/favicon.ico", (req, res) => {
  return res.status(404).send("");
});

// let antiBot = {}
app.all("*", function (req, res) {
  // 404
  let message = `未知 API`;
  logger(req, "", message);
});

const server = app.listen(config.port, () => {
  console.log("[启动信息] 服务器已启动, 访问端口为: " + server.address().port);
});

// 处理SIGTERM信号，优雅关闭服务器
process.on("SIGTERM", () => {
  console.log("[关闭信息] 收到SIGTERM信号，正在关闭服务器...");
  server.close(() => {
    console.log("[关闭信息] 服务器已关闭");
    process.exit(0);
  });
});

// 使用cron表达式设置每小时执行一次的定时任务
cron.schedule("0 * * * *", () => {
  console.log("[定时任务] 正在执行定时任务...");
  clearOldLogs();
});
