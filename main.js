import express from "express";

import logger from "./controllers/log/logger.js";
import { clearOldLogs } from "./controllers/log/logCleaner.js";
import config from "./common/config.js";

const app = express(); // Express app
app.use(
  express.json({
    // use JSON body
    limit: "4mb",
  })
);
app.set("trust proxy", config.nginxMode); // 允许 Express 信任上级代理提供的 IP 地址

app.all("/*", async (req, res, next) => {
  res.header("Content-Type", "application/json"); // 指定客户端请求的属性
  res.header("Access-Control-Allow-Origin", "*"); // 允许跨域
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  next();
});

import main from "./router/main.js"; // main router
import online from "./router/online.js"; // 在线量
import collect from "./router/collect.js"; // 帖子收藏
import temp from "./router/temp.js"; // 临时文件直链
import cdn from "./router/cdn.js"; // 图片 cdn 相关
import topic from "./router/topic.js"; // 小组帖子相关
app.use("/v1", main);
app.use("/v1/online", online);
app.use("/v1/collect", collect);
app.use("/v1/temp", temp);
app.use("/v1/cdn", cdn);
app.use("/v1/topic", topic);
app.use("/pic/cover/*", (req, res) => {
  // 修复 DogeCode OSS 回源 BUG (偶尔不请求设定的前缀)
  res.redirect(302, "/v1/cdn/getimage" + req.baseUrl);
});

app.get("/favicon.ico", (req, res) => {
  return res.status(404).send("");
});

// let antiBot = {}
app.all("*", function (req, res) {
  // 404
  let message = `未知 API`;
  logger(req, "", message);
});

const server = app.listen(7090, () => {
  console.log("[启动信息] 服务器已启动, 访问端口为: " + server.address().port);
});

setInterval(() => {
  // 每一小时会触发一次的定时任务
  console.log("[定时任务] 正在执行定时任务...");
  clearOldLogs();
}, 1000 * 60 * 60);
