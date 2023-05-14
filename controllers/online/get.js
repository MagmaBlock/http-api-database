import { promiseDB } from "../../common/databaseConnection.js";
import logger from "../log/logger.js";

export async function getOnlineUsersAPI(req, res) {
  let apiName = "getOnlineUsersAPI";
  try {
    let threeDayBefore = new Date(new Date() - 1000 * 60 * 60 * 24 * 3);

    let allOnline = await promiseDB.query(
      "SELECT * FROM online WHERE last_online > ?",
      [threeDayBefore]
    );

    let result = {};
    allOnline[0].forEach(
      (raw) => (result[raw.user_id] = raw.last_online.getTime())
    );

    let message = `${threeDayBefore} 后登录用户`;
    res.send({ code: 200, message, data: result });
    logger(req, "", message);
  } catch (error) {
    console.error(error, "获取历史在线时出现错误!");
    res.send({ code: 500, message: "服务器内部错误" });
    return;
  }
}
