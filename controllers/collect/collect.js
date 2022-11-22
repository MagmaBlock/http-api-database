import { promiseDB } from "../../common/databaseConnection.js";
import { getTotalColl } from "./topic.js";

// POST
// 此 API 修改用户对指定 Topic 的收藏状态, 请求主体中需要提供 userID topicID
export async function collectAPI(req, res) {
  let userID = req.body.userID
  let topicID = req.body.topicID
  let collect = Boolean(req.body.collect)
  if (!userID || !topicID || typeof req.body.collect != 'boolean')
    return res.send({ code: 400, message: '参数缺失或 collect 非 Boolean' })

  try {
    await changeCollect(userID, topicID, collect) // undefined
    let total = await getTotalColl(topicID) // Number
    res.send({ code: 200, message: '', data: { total } })
  } catch (error) {
    res.send({ code: 500, message: '服务器内部错误' })
  }

}

// GET
// 获取此用户的所有收藏
export async function getUserCollectAPI(req, res) {
  let userID = req.query.userID
  if (!userID) return res.send({ code: 400, message: '参数缺失' })
  try {
    let collectList = await getUserCollect(userID)
    let parsedList = collectList.map(collect => {
      return {
        id: collect.topic_id,
        createTime: collect.create_time
      }
    })
    res.send({
      code: 200, message: '', data: parsedList
    })
  } catch (error) {
    res.send({ code: 500, message: '服务器内部错误' })
  }
}

// 改变创建或删除收藏
export async function changeCollect(userID, topicID, isCollected) {
  if (isCollected == true) { // do collect
    await deleteCollect(userID, topicID)
    await doCollect(userID, topicID)
  }
  if (isCollected == false) { // delete
    await deleteCollect(userID, topicID)
  }
}

// 单纯的插入一条收藏的记录
async function doCollect(userID, topicID) {
  if (!userID || !topicID) return
  let dbResult = await promiseDB.query('INSERT INTO collect (user_id, topic_id) VALUES (?,?)', [userID, topicID])
  return dbResult
}

// 删除此 userID 和 topicID 所有的记录
async function deleteCollect(userID, topicID) {
  if (!userID || !topicID) return
  let dbResult = await promiseDB.query('DELETE FROM collect WHERE user_id = ? AND topic_id = ?', [userID, topicID])
  return dbResult
}

// 获取此 userID 所有的记录
async function getUserCollect(userID) {
  if (!userID) return
  let dbResult = await promiseDB.query('SELECT * FROM collect WHERE user_id = ?', [userID])
  return dbResult[0]
}

// 获取此 userID 和 topicID 的收藏记录
export async function getCollectRecord(userID, topicID) {
  let dbResult = await promiseDB.query('SELECT * FROM collect WHERE user_id = ? AND topic_id = ?', [userID, topicID])
  return dbResult[0]
}