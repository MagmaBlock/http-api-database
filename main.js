import express from "express";

import logger from "./controllers/log/logger.js";
import requestData from "./controllers/request/requestData.js";
import { clearOldLogs } from "./controllers/log/logCleaner.js";

const app = express(); // Express app
app.use(express.json({ // use JSON body
  limit: '4mb'
}));

app.all('/*', async (req, res, next) => {

  res.header('Content-Type', 'application/json'); // 指定客户端请求的属性
  res.header('Access-Control-Allow-Origin', '*'); // 允许跨域
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  requestData(req)
  next();
});

import main from "./router/main.js"; // main router
import online from './router/online.js' // 在线量
import collect from './router/collect.js' // 帖子收藏
import temp from './router/temp.js' // 临时文件直链 
app.use('/v1', main);
app.use('/v1/online', online)
app.use('/v1/collect', collect)
app.use('/v1/temp', temp)

// let antiBot = {}
app.all('*', function (req, res) { // 404
  let message = `未知 API`
  // res.send({ code: 404, message: '未知 API' })
  logger(req.originalUrl, 'UNKNOW', 404, message, requestData(req).ip)
})

const server = app.listen(7090, () => {
  console.log("[启动信息] 服务器已启动, 访问端口为: " + server.address().port)
})

setInterval(() => { // 每一小时会触发一次的定时任务
  console.log('[定时任务] 正在执行定时任务...');
  clearOldLogs()
}, 1000 * 60 * 60)