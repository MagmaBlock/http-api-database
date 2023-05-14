import logger from "./log/logger.js";
import dbQuery from "./tools/dbQuery.js";
import emojiParser from "./tools/emojiParser.js";
import isJSON from "./tools/isJson.js";

export default async function updateKeyAPI(req, res) {
  let apiName = "updateKeyAPI";
  try {
    let key = req.body.key;
    let value = req.body.value;

    if (!key || (isJSON(value) && value != "")) {
      let message = "请求语法错误";
      res.send({ code: 400, message });
      logger(req, key, message);
      return;
    }

    let ifSuccess = await updateValueByKey(key, value);

    if (ifSuccess) {
      let message = "成功";
      res.send({ code: 200, message });
      logger(req, key, message);
    } else {
      let message = "插入或更新失败";
      res.send({ code: 500, message });
      logger(req, key, message);
    }
  } catch (error) {
    let message = "服务器内部错误";
    res.send({ code: 500, message });
    logger(req, key, message);
  }
}

async function updateValueByKey(key, value) {
  if (typeof value == "object" || typeof value == "number") {
    // 将对象转义为 JSON 字符串
    value = JSON.stringify(value);
  }

  value = emojiParser.stringify(value); // 转义 emoji, 此时的 value 已是 String

  let dbResult = await dbQuery(
    "INSERT INTO `main` (`key`, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value = ?, update_time = CURRENT_TIMESTAMP",
    [key, value, value]
  );

  if (dbResult.affectedRows) {
    return true;
  }
}
