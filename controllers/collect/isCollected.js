import { promiseDB } from "../../common/databaseConnection.js"
import logger from "../log/logger.js"
import { getCollectRecord } from "./collect.js"
import { getTotalColl } from "./topic.js"

// GET
// 此 API 可以查询某用户是否收藏某 Topic，同时会返回 Topic 的总收藏数量
export async function isCollectedAPI(req, res) {
  let userID = req.query.userID
  let topicID = req.query.topicID
  if (!userID || !topicID) return res.send({ code: 400, message: '缺少参数' })

  try {
    let collect = await getCollectRecord(userID, topicID) // Object
    let total = await getTotalColl(topicID) // Number
    let collected = collect[0] ? true : false // Boolean
    let collectTime = collect[0] ? new Date(collect[0].create_time).getTime() : -1 // Timestamp

    let message = '成功'
    res.send({
      code: 200, message, data: {
        collected, collectTime, total
      }
    })
    logger(req, [userID, topicID], message)

  } catch (error) {
    console.error(error, '\nisCollectedAPI 发生错误!')
    res.send({ code: 500, message: 'Server Error' })
  }
}


// 暂时弃用
export async function isCollected(userID, topicID) {
  let dbResult = await (
    promiseDB.query('SELECT COUNT(*) FROM collect WHERE user_id = ? AND topic_id = ?', [userID, topicID])
  )
  return Boolean(dbResult[0][0]['COUNT(*)'])
}