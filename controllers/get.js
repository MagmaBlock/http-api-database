import { promiseDB } from "../common/databaseConnection.js";
import logger from "./log/logger.js";
import requestData from "./request/requestData.js";
import emojiParser from "./tools/emojiParser.js";
import isJSON from "./tools/isJson.js";

export default async function get(req, res) {
  try {

    let key = req.params[0]; // 请求的ID

    if (!key) { // 未提供 Key
      let message = '未提供 Key'
      res.send({ code: 400, message })
      logger(key || '', 'GET', 400, message, requestData(req).ip)
      return;
    }

    let result = await getValueByKey(key); // 查询结果

    if (result) { // 有数据
      let message = '成功'
      res.send({
        code: 200, message, data: result.value,
        lastUpdate: result.update_time ? result.update_time.getTime() : -1,
        key: result.key
      })
      logger(key, 'GET', 200, message, requestData(req).ip)
      return;
    }

    if (!result) { // 找不到
      let message = '无此 Key'
      res.send({ code: 404, message, data: "" })
      logger(key, 'GET', 404, message, requestData(req).ip)
      return;
    }

  } catch (error) {

    console.error(error, '执行 GET 时发生错误! ');
    res.send({ code: 500, message: '服务器内部错误' })

  }
}

async function getValueByKey(key) {
  let dbResult = await promiseDB.query(
    'SELECT * FROM `main` WHERE `key` = ?',
    [key]
  )
  if (dbResult[0].length == 0) return false // 如果找不到此 Key 直接返回 false
  let result = dbResult[0][0]
  result.value = emojiParser.parse(result.value) // 解析转译后的 Emoji

  if (isJSON(result.value)) { // 解析 JSON
    result.value = JSON.parse(result.value);
  }

  return result;
}