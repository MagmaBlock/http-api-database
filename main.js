import express from "express";

import logger from "./controllers/log/logger.js";
import requestData from "./controllers/request/requestData.js";

const app = express(); // Express app
app.use(express.json()); // use JSON body

app.all('/*', async (req, res, next) => {

  res.header('Content-Type', 'application/json'); // 指定客户端请求的属性
  res.header('Access-Control-Allow-Origin', '*'); // 允许跨域
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // console.log(`[${nowTime}][${req.method} ${ip}] ${req.url}`);
  requestData(req)
  next();
});

import main from "./router/main.js"; // main router
app.use('/v1', main);

app.all('*', function (req, res) { // 404
  let message = '未知 API'
  res.send({ code: 404, message })
  logger(req.originalUrl, 'UNKNOW', 404, message, requestData(req).ip)
})

const server = app.listen(7090, () => {
  console.log("[启动信息] 服务器已启动, 访问端口为: " + server.address().port)
})