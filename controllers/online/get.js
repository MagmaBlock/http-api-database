import { promiseDB } from "../../common/databaseConnection.js";
import logger from "../log/logger.js";
import requestData from "../request/requestData.js";

export async function getOnlineUsers(req, res) {
  try {

    let threeDayBefore = new Date(new Date() - 1000 * 60 * 60 * 24 * 3)

    let allOnline = await promiseDB.query(
      'SELECT * FROM online WHERE last_online > ?', [threeDayBefore]
    )

    let result = {}
    allOnline[0].forEach(
      raw => result[raw.user_id] = raw.last_online.getTime()
    )

    let message = `${threeDayBefore} 后登录用户`
    res.send({ code: 200, message, data: result })
    logger('', 'GET / 在线人数', 200, message, requestData(req).ip)

  } catch (error) {
    console.error(error, '获取历史在线时出现错误!')
    res.send({ code: 500, message: '服务器内部错误' })
    return
  }
}