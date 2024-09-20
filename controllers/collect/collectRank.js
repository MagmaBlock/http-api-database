import { promiseDB } from "../../common/databaseConnection.js";
import logger from "../log/logger.js";

export async function collectRankAPI(req, res) {
  const { startTime, endTime, count = 100, startsWith } = req.body;
  
  // 检查 count 是否为数字
  if (isNaN(parseInt(count))) {
    return res.send({ code: 400, message: "count 必须是数字" });
  }

  // 将 count 转换为整数
  const limitCount = parseInt(count);

  if (
    startTime &&
    !(new Date(startTime) instanceof Date && !isNaN(new Date(startTime)))
  ) {
    return res.send({ code: 400, message: "开始时间格式不正确" });
  }

  if (
    endTime &&
    !(new Date(endTime) instanceof Date && !isNaN(new Date(endTime)))
  ) {
    return res.send({ code: 400, message: "结束时间格式不正确" });
  }

  if (startTime && endTime && new Date(startTime) > new Date(endTime)) {
    return res.send({ code: 400, message: "开始时间不能晚于结束时间" });
  }

  if (startsWith !== undefined && typeof startsWith !== "string") {
    return res.send({ code: 400, message: "startsWith 必须是字符串" });
  }

  let query = `
    SELECT topic_id, COUNT(*) as collect_count
    FROM collect
    WHERE 1=1
  `;
  const queryParams = [];

  if (startTime) {
    query += " AND create_time >= ?";
    queryParams.push(new Date(startTime));
  }

  if (endTime) {
    query += " AND create_time <= ?";
    queryParams.push(new Date(endTime));
  }

  // 使用参数化查询来防止 SQL 注入
  if (startsWith) {
    query += " AND user_id LIKE CONCAT(?, '%')";
    queryParams.push(startsWith);
  }

  query += `
    GROUP BY topic_id
    ORDER BY collect_count DESC
    LIMIT ?
  `;
  queryParams.push(limitCount);

  try {
    const [results] = await promiseDB.query(query, queryParams);

    const message = "成功获取收藏排行榜";
    res.send({ code: 200, message, data: results });
    logger(req, null, message);
  } catch (error) {
    console.error(error);
    res.send({ code: 500, message: "服务器内部错误" });
  }
}
