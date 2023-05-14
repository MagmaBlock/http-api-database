import { createHash } from "crypto";
import { promiseDB } from "../../common/databaseConnection.js";
import logger from "../log/logger.js";

let tempSaveTime = 5 * 60 * 1000; // 默认情况下一个文件的过期时间
// 每五分钟将数据库中过期的文件清理一下
setInterval(async () => {
  let result = await promiseDB.query(
    "DELETE FROM temp_file WHERE expire_time < current_time() AND forever = 0"
  );
  console.log("已清理过期临时文件:", result[0].affectedRows, "个.");
}, 5 * 60 * 1000);

export async function uploadFileAPI(req, res) {
  let { fileName, fileContent } = req.body;
  if (!fileName || !fileContent)
    return res.send({ code: 400, message: "参数错误" });

  // 计算过期时间，目前只有 -1 和 undefined 两种情况
  let fileExpire = new Date();
  let forever = false;
  if (req.body?.fileExpire == -1) {
    forever = true;
  } else if (!req.body?.fileExpire) {
    fileExpire = new Date(new Date().getTime() + tempSaveTime);
  } else {
    return res
      .status(400)
      .send({ code: 400, message: "目前若提供过期时间, 必须为 -1" });
  }

  // 为此文件创建一个下载的密钥
  let downloadKey = createHash("sha1")
    .update(fileName + new Date().getTime())
    .digest("hex");

  // 将文件存储到数据库
  try {
    await promiseDB.query(
      "INSERT INTO temp_file (`key`,file_name,file_content,expire_time,forever) VALUES (?,?,?,?,?)",
      [downloadKey, fileName, fileContent, fileExpire, forever]
    );
  } catch (error) {
    return res.status(500).send({ code: 500, message: "服务器错误" });
  }

  // 回复客户端
  let message = "成功";
  res.send({
    code: 200,
    message,
    data: {
      downloadKey,
    },
  });
  logger(req, fileName, message);
}

export async function downloadFileAPI(req, res) {
  let downloadKey = req.params.key;
  let file;
  try {
    file = await promiseDB.query("SELECT * FROM temp_file WHERE `key` = ?", [
      downloadKey,
    ]);
  } catch (error) {
    return res.status(500).send({ code: 500, message: "服务器错误" });
  }

  // 找到了文件
  if (file[0][0]?.key == downloadKey) {
    let fileContent = file[0][0].file_content;
    let fileName = file[0][0].file_name;
    res.set("Content-Type", "application/octet-stream");
    res.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    res.send(fileContent);
    logger(req, fileName, "已发送文件");
  } else {
    let message = "文件已过期或不存在";
    res.status(404).send(message);
    logger(req, downloadKey, message);
  }
}
