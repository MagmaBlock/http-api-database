import { promiseDB } from "../../common/databaseConnection.js";
import logger from "../log/logger.js";
import requestData from "../request/requestData.js";

export async function onlineReportAPI(req, res) {
  let apiName = 'onlineReportAPI'
  try {

    let userID = req.body.userID;
    if (!userID) { // Wrong query
      let message = '参数错误'
      res.send({ code: 400, message })
      logger(req, userID, message)
      return
    }

    let updateSuccess = false
    let thisUserInDB = await promiseDB.query('SELECT * FROM online WHERE user_id = ?', [userID])
    if (thisUserInDB[0].length > 0) { // 此用户已存在
      let updateQuery = await promiseDB.query(
        'UPDATE online SET last_online = ? WHERE user_id = ?', [new Date(), userID]
      )
      if (updateQuery[0].affectedRows) updateSuccess = true
    } else { // 此用户第一次进行上报
      let insertQuery = await promiseDB.query(
        'INSERT INTO online (user_id, last_online) VALUES (?, ?)', [userID, new Date()]
      )
      if (insertQuery[0].affectedRows) updateSuccess = true
    }

    if (updateSuccess) {
      let message = '成功上报'
      res.send({ code: 200, message })
      logger(req, userID, message)
    } else {
      let message = '服务器内部错误'
      res.send({ code: 500, message })
      logger(req, userID, message)
    }

  } catch (error) {
    console.error(error, '处理上报在线时出现错误!')
    let message = '服务器内部错误'
    res.send({ code: 500, message })
    return
  }
}