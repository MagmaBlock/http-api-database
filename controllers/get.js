import dbQuery from "../controllers/tools/dbQuery.js"
import logger from "./log/logger.js";
import requestData from "./request/requestData.js";
import isJSON from "./tools/isJson.js";

export default async function get(req, res) {
  try {

    let key = req.params[0]; // 请求的ID

    if (!key) { // 未提供 Key
      let message = '未提供 Key'
      res.send({ code: 400, message, data: "" })
      logger(key || '', 'GET', 400, message, requestData(req).ip)
      return;
    }

    let result = await getValueByKey(key); // 查询结果

    if (result[0]) { // 有数据
      let value = result[0].value;
      if (isJSON(value)) {
        value = JSON.parse(value);
      }
      let message = '成功'
      res.send({ code: 200, message, data: value })
      logger(key, 'GET', 200, message, requestData(req).ip)
      return;
    }

    if (result.length == 0) { // 找不到
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
  let dbResult = await dbQuery(
    'SELECT * FROM `main` WHERE `key` = ?',
    [key]
  )
  return dbResult;
}