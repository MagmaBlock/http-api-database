import dbQuery from "../tools/dbQuery.js";
import chalk from "chalk";
import { VersionTool } from "./appVersion/versionTool.js";

// 存储访问次数
let store = {};
function counter(cKey, cType = "default") {
  if (!store[cType]) store[cType] = {};
  if (store[cType][cKey]) {
    return ++store[cType][cKey];
  } else {
    return (store[cType][cKey] = 1);
  }
}

// 存储某 IP 下用户信息
let ipStore = {};

/**
 * Log 打印器, 会将 log 打印至控制台, 并保存至数据库
 * @param {Object} req Express 请求体
 * @param {*} query 查询, 一般是客户端的关键词, 将会打印在白字
 * @param {*} message 消息, 将会以次要消息显示到控制台
 */
export default async function logger(req, query, message) {
  let ip = req.ip;
  let time = new Date().toLocaleTimeString();
  let path = decodeURIComponent(req.originalUrl.split("?")[0]);
  let user = ipStore[ip] ?? null;
  let typeLog = ` ${req.method} `;
  typeLog = (() => {
    switch (req.method) {
      case "GET":
        return (typeLog = chalk.bgGreen(typeLog));
      case "POST":
        return (typeLog = chalk.bgBlue(typeLog));
      default:
        return (typeLog = chalk.bgGray(typeLog));
    }
  })();

  // 如果有用户名上报, 暂存至内存
  try {
    if (query.toString().startsWith("u_") && req.method == "POST") {
      // 上报 u_ 时
      let userInfo = {
        isPayed: req.body?.value?.a,
        userID: query.toString().replace("u_", ""),
        clientVersion: req.body?.value?.v,
        isIPA: req.body?.value?.ipa
      }
      ipStore[ip] = userInfo;
      user = userInfo;
    }
  } catch (error) {
    console.error("暂存 IP ID 时出错: ", error);
  }

  try {
    dbQuery(
      "INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)",
      [JSON.stringify(query), path, "", JSON.stringify(message), user?.userID || ip]
    );
  } catch (error) {
    console.error(error);
  }

  console.log(
    chalk.dim(time),
    chalk.bgBlueBright(` ${counter(ip)} `),
    user ? userPrinter(user) : chalk.dim(ip),
    typeLog + chalk.bgGrey(` ${path} `),
    query,
    chalk.dim(JSON.stringify(message))
  );
}


const versionTool = new VersionTool();

function userPrinter(user) {
  let result = "";
  if (user?.isPayed) {
    result += chalk.yellowBright(user?.userID)
  } else {
    result += user?.userID
  }

  result += " "

  let distance = versionTool.getLatestDistance(user?.clientVersion)

  if (distance == 0) {
    result += chalk.bgGreen(` √ `)
  } else if (distance != -1) {
    result += chalk.bgBlue(` ${distance} `)
  } else {
    result += chalk.bgRed(` × `)
  }
  result += chalk.bgGrey(` ${user?.clientVersion ?? '?'} `)

  return result;
}