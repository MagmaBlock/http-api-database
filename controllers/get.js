import dbQuery from "../controllers/tools/dbQuery.js"
import isJSON from "./tools/isJson.js";

export default async function get(req, res) {

  let key = req.params[0]; // 请求的ID

  if (!key) { // 未提供 Key
    res.send({ code: 400, message: "未提供 Key", data: "" })
    console.log(`[GET] 400 非法请求 未提供 Key`);
    return;
  }

  let result = await getValueByKey(key); // 查询结果

  if (result[0]) { // 有数据
    let value = result[0].value;
    if (isJSON(value)) {
      value = JSON.parse(value);
    }
    res.send({ code: 200, message: "成功", data: value })
    console.log(`[GET] 200 [key ${key}]`);
    return;
  }

  if (result.length == 0) { // 找不到
    res.send({ code: 404, message: "无此 Key", data: "" })
    console.log(`[GET] 404 [key ${key}]`);
    return;
  }
}

async function getValueByKey(key) {
  let dbResult = await dbQuery(
    'SELECT * FROM `main` WHERE `key` = ?',
    [key]
  )
  return dbResult;
}