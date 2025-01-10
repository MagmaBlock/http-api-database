import chalk from "chalk";
import { createStorage, prefixStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import config from "../../common/config.js";
import dbQuery from "../tools/dbQuery.js";
import { VersionTool } from "./appVersion/versionTool.js";

// 如果指定了 Redis 则使用 Redis 作为缓存，否则使用内存作为缓存
const cacheKV = config.redisUrl
  ? createStorage({
      driver: redisDriver({
        url: config.redisUrl,
        base: "http-api-database",
      }),
    })
  : createStorage();
const ipCount = prefixStorage(cacheKV, "ip-count");
const ipUser = prefixStorage(cacheKV, "ip-user");

/**
 * 计数器，统计指定key的访问次数
 * @param {string} cKey 计数key
 */
async function counter(cKey) {
  const currentCount = await ipCount.getItem(cKey);

  const count = (currentCount ?? 0) + 1;
  ipCount.setItem(cKey, count);
  return count;
}

/**
 * Log 打印器, 会将 log 打印至控制台, 并保存至数据库
 * @param {Object} req Express 请求体
 * @param {*} query 查询, 一般是客户端的关键词, 将会打印在白字
 * @param {*} message 消息, 将会以次要消息显示到控制台
 */
export default async function logger(req, query, message) {
  const ip = req.ip;
  const time = new Date().toLocaleTimeString();
  const path = decodeURIComponent(req.originalUrl.split("?")[0]);
  let user = await ipUser.getItem(ip);
  const typeLog = getMethodLog(req.method);

  // 如果有用户名上报, 暂存至内存
  if (query && query.toString().startsWith("u_") && req.method === "POST") {
    try {
      const userInfo = {
        isPayed: req.body?.value?.a,
        userID: query.toString().replace("u_", ""),
        clientVersion: req.body?.value?.v,
        isIPA: req.body?.value?.ipa,
        n: req.body?.value?.n,
      };
      await ipUser.setItem(ip, userInfo);

      user = userInfo;
    } catch (error) {
      console.error("暂存 IP ID 时出错: ", error);
    }
  }

  // 异步写入日志到数据库（不等待完成）
  dbQuery(
    "INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)",
    [
      JSON.stringify(query),
      path,
      "",
      JSON.stringify(message),
      user?.userID || ip,
    ]
  ).catch((error) => {
    console.error("数据库写入失败: ", error);
  });

  // 打印日志到控制台
  printConsoleLog({
    time,
    user,
    ip,
    typeLog,
    path,
    query,
    message,
    count: await counter(ip),
  });
}

const versionTool = new VersionTool();

/**
 * 根据请求方法生成带颜色的日志标记
 * @param {string} method HTTP方法
 * @returns {string} 带颜色的日志标记
 */
function getMethodLog(method) {
  const typeLog = ` ${method} `;
  switch (method) {
    case "GET":
      return chalk.bgGreen(typeLog);
    case "POST":
      return chalk.bgBlue(typeLog);
    default:
      return chalk.bgGray(typeLog);
  }
}

/**
 * 打印日志到控制台
 * @param {Object} params 日志参数
 * @param {string} params.time 时间
 * @param {Object|null} params.user 用户信息
 * @param {string} params.ip IP地址
 * @param {string} params.typeLog 请求方法日志
 * @param {string} params.path 请求路径
 * @param {*} params.query 查询参数
 * @param {*} params.message 消息
 * @param {number} params.count 访问计数
 */
function printConsoleLog({
  time,
  user,
  ip,
  typeLog,
  path,
  query,
  message,
  count,
}) {
  const logBlocks = [
    chalk.dim(time),
    user?.n ? chalk.bgMagenta(` ${user?.n} `) : null,
    countPrinter(count),
    user ? userPrinter(user) : chalk.dim(ip),
    `${typeLog}${chalk.bgGrey(` ${path} `)}`,
    query,
    chalk.dim(JSON.stringify(message)),
  ].filter(Boolean);

  console.log(logBlocks.join(" "));
}

/**
 * 格式化用户信息输出
 * @param {Object} user 用户信息对象
 * @param {boolean} user.isPayed 是否付费用户
 * @param {string} user.userID 用户ID
 * @param {string} user.clientVersion 客户端版本
 * @param {boolean} user.isIPA 是否IPA用户
 * @returns {string} 格式化后的用户信息字符串
 */
function userPrinter(user) {
  let result = "";
  if (user?.isPayed) {
    result += chalk.yellowBright(user?.userID);
  } else {
    result += user?.userID;
  }

  result += " ";

  let distance = versionTool.getLatestDistance(user?.clientVersion);

  if (distance == 0) {
    result += chalk.bgGreen(` √ `);
  } else if (distance != -1 && distance <= 5) {
    result += chalk.bgBlue(` ${distance} `);
  } else {
    result += chalk.bgGray(` ${distance == -1 ? "×" : distance} `);
  }
  result += chalk.bgGrey(` ${user?.clientVersion ?? "?"}`);
  result += user?.isIPA ? chalk.bgGray(` IPA `) : chalk.bgGray(` `);

  return result;
}

/**
 * 格式化访问计数输出
 * @param {number} count 访问次数
 * @returns {string} 格式化后的计数字符串
 */
function countPrinter(count) {
  if (count < 50) {
    return chalk.bgGray(` ${count} `);
  } else if (count < 100) {
    return chalk.bgBlue(` ${count} `);
  } else {
    return chalk.bgGreen(` ${count} `);
  }
}
