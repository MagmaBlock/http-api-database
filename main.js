import express from "express";
import config from "./common/config.js";

import db from './common/databaseConnection.js'

const app = express();
app.use(express.json());

app.all('/*', async (req, res, next) => {
  res.header('Content-Type', 'application/json'); // 指定客户端请求的属性
  res.header('Access-Control-Allow-Origin', '*'); // 允许跨域
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  let nowTime = new Date().toLocaleString(); // 获取当前时间
  let ip = req.ip;
  // 兼容nginx代理
  if (req.headers['x-real-ip'] && config.nginxMode) ip = req.headers['x-real-ip'];
  console.log(`[传入请求] [${ip}] ${req.method} ${req.url} [${nowTime}]`);
  next();
});

import main from "./router/main.js";
app.use('/v1', main);

const server = app.listen(7090, () => {
  console.log("[启动信息] 服务器已启动, 访问端口为: " + server.address().port)
})