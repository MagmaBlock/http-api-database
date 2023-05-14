import { promiseDB } from "../../common/databaseConnection.js";

export async function updateTopicAPI(req, res) {
  let {
    id,
    title,
    message,
    userId,
    userName,
    avatar,
    group,
    groupHref,
    groupThumb,
    time,
  } = req.body;

  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).send({ code: 400, message: "id 必须是正整数" });

  time = new Date(time);
  if (time.toString() == "Invalid Date")
    return res.status(400).send({ code: 400, message: "time 必须是 NodeJS Date() 能够解析的内容" });

  try {
    await promiseDB.execute(
      "INSERT INTO topic ( `id`, title, message, userId, userName, avatar, `group`, groupHref, groupThumb, `time` ) VALUES ( ?,?,?,?,?,?,?,?,?,? ) ON duplicate KEY UPDATE title = ?, message = ?, userId = ?, userName = ?, avatar = ?, `group` = ?, groupHref = ?, groupThumb = ?, `time` = ?;",
      [
        // INSERT
        id,
        title,
        message,
        userId,
        userName,
        avatar,
        group,
        groupHref,
        groupThumb,
        time,
        // UPDATE
        title,
        message,
        userId,
        userName,
        avatar,
        group,
        groupHref,
        groupThumb,
        time,
      ]
    );
  } catch (error) {
    console.error(error, "updateTopicAPI 插入数据库时发生意外");
    return res.status(500).send({ code: 500 });
  }

  return res.send({ code: 200, message: "成功" });
}
