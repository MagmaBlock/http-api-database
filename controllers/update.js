import dbQuery from "./tools/dbQuery.js";
import isJSON from "./tools/isJson.js";

export default async function update(req, res) {

  if (!req.body.key || isJSON(req.body.value) && req.body.value != '') {
    res.send({ code: 400, message: "请求语法错误" });
    console.log(`[UPDATE] 400 非法请求 请求语法错误`);
    return
  }

  let ifSuccess = await updateValueByKey(req.body.key, req.body.value);

  if (ifSuccess) {
    res.send({ code: 200, message: '成功' })
    console.log(`[UPDATE] 200 [key ${req.body.key}]`);
  }
  else {
    res.send({ code: 500, message: '插入或更新失败' })
    console.log(`[UPDATE] 500 插入或更新失败 [key ${req.body.key}]`);
  }

}

async function updateValueByKey(key, value) {

  if (typeof value == 'object') {
    value = JSON.stringify(value);
  }

  let dbResult = await dbQuery(
    'INSERT INTO `main` (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY update `value`=?',
    [key, value, value]
  );

  if (dbResult.affectedRows) {
    return true;
  }

}