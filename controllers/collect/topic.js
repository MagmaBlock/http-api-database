import { promiseDB } from "../../common/databaseConnection.js";

export async function getTotalColl(topicID) {
  let dbResult = await promiseDB.query('SELECT COUNT(*) FROM collect WHERE topic_id = ?', [topicID])
  let total = dbResult[0][0]['COUNT(*)']
  return total
}