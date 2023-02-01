import { promiseDB } from "../common/databaseConnection.js";
import logger from "./log/logger.js";
import emojiParser from "./tools/emojiParser.js";
import isJSON from "./tools/isJson.js";

export async function getKeyAPI(req, res) {
  let apiName = 'getKeyAPI'
  try {

    let key = req.params[0]; // 请求的ID

    if (!key) { // 未提供 Key
      let message = '未提供 Key'
      res.send({ code: 400, message })
      logger(req, key, message)
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
      logger(req, key, message)
      return;
    }

    if (!result) { // 找不到
      let message = '无此 Key'
      res.send({ code: 404, message, data: "" })
      logger(req, key, message)
      return;
    }

  } catch (error) {

    console.error(error, '执行 GET 时发生错误! ');
    res.send({ code: 500, message: '服务器内部错误' })

  }
}

// 高级查询 (POST)
export async function advancedGetAPI(req, res) {
  let apiName = 'advancedGetAPI'
  try {

    if (!Array.isArray(req.body.keys) || req.body.keys.length == 0) return res.send({ code: 400, message: '请求参数不合法' })
    let keys = req.body.keys

    let result = await getValueByKeys(keys)

    let message = '成功'
    res.send({ code: 200, message, data: result })
    let keyMsg = ''
    keys.forEach((key, index) => {
      if (index < 3) {
        keyMsg = keyMsg + key + ' '
      }
    })
    if (keys.length > 3) keyMsg = keyMsg + "等共" + keys.length + "个 Keys."
    logger(req, keyMsg, message)


  } catch (error) {

    console.error(error, '执行 GETs 时发生错误! ');
    res.send({ code: 500, message: '服务器内部错误' })

  }
}

// APIs
// ============
// Controllers

/**
 * 通过键名获取存储的值
 * @param {String} key 键名
 * @returns {Object} 结果 value + update_time
 */
export async function getValueByKey(key) {
  let dbResult = await promiseDB.query(
    'SELECT * FROM `main` WHERE `key` = ?',
    [key]
  )
  if (dbResult[0].length == 0) return false // 如果找不到此 Key 直接返回 false
  let result = dbResult[0][0]
  result.value = resultParser(result.value)
  return result;
}

export async function getValueByKeys(keys) {
  let dbResult = await promiseDB.query(
    'SELECT * FROM `main` WHERE `key` IN (?)',
    [keys]
  )
  let result = {}
  keys.forEach(key => { // 404 兜底
    result[key] = null
  })
  dbResult[0].forEach(element => {
    result[element.key] = resultParser(element.value)
  })

  return result
}

// 将数据库中的 String 解析为 JSON 和 emoji 等
function resultParser(value) {
  value = emojiParser.parse(value)
  if (isJSON(value)) {
    value = JSON.parse(value)
  }
  return value
}