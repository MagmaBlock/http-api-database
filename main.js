import express from "express";

import logger from "./controllers/log/logger.js";
import requestData from "./controllers/request/requestData.js";
import { clearOldLogs } from "./controllers/log/logCleaner.js";

const app = express(); // Express app
app.use(express.json()); // use JSON body

app.all('/*', async (req, res, next) => {

  res.header('Content-Type', 'application/json'); // 指定客户端请求的属性
  res.header('Access-Control-Allow-Origin', '*'); // 允许跨域
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  requestData(req)
  next();
});

import main from "./router/main.js"; // main router
import online from './router/online.js' // 在线量
app.use('/v1', main);
app.use('/v1/online', online)

// let antiBot = {}
app.all('*', function (req, res) { // 404
  // // 反 Bot 计数
  // if (antiBot[requestData(req).ip] === undefined) antiBot[requestData(req).ip] = { times: 1 }
  // else antiBot[requestData(req).ip].times++
  // antiBot.all = antiBot.all ? antiBot.all + 1 : 1
  // // 触发拦截
  // if (antiBot[requestData(req).ip].times > 5 || antiBot.all > 10) {
  //   return console.log(`[${requestData(req).ip}]`, '404 未知 API, 已忽略')
  // }
  let message = `未知 API`
  // res.send({ code: 404, message: '未知 API' })
  logger(req.originalUrl, 'UNKNOW', 404, message, requestData(req).ip)
})

const server = app.listen(7090, () => {
  console.log("[启动信息] 服务器已启动, 访问端口为: " + server.address().port)
})

setInterval(() => { // 每十分钟清除一次全局 404 计数
  antiBot.all = 0
}, 1000 * 60 * 10)

setInterval(() => { // 每一小时会触发一次的定时任务
  console.log('[定时任务] 正在执行定时任务...');
  clearOldLogs()
}, 1000 * 60 * 60)