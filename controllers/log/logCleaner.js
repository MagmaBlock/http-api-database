import config from "../../common/config.js";
import { promiseDB } from "../../common/databaseConnection.js";

export async function clearOldLogs() {
  let query = await promiseDB.query("DELETE FROM log WHERE time < ?", [
    new Date(new Date() - config.logRetentionDays * 24 * 60 * 60 * 1000),
  ]);
  console.log(`[日志清理] 成功删除了 ${query[0].affectedRows} 条过期日志`);
}
