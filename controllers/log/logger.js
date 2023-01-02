import dbQuery from "../tools/dbQuery.js";
import chalk from "chalk";
import { getValueByKey } from "../get.js";

let store = {}
function counter(cKey, cType = 'default') {
  if (!store[cType]) store[cType] = {}
  if (store[cType][cKey]) {
    return ++store[cType][cKey]
  } else {
    return store[cType][cKey] = 1
  }
}

let ipStore = {}
function saveUserName(ip, name) {
  ipStore[ip] = name
}
function getUserName(ip) {
  if (ipStore[ip]) return `${ip} ${ipStore[ip]}`
  else return ip
}

/**
 * Log 打印器, 会将 log 打印至控制台, 并保存至数据库
 * @param {Object} req Express 请求体
 * @param {*} query 查询, 一般是客户端的关键词, 将会打印在白字
 * @param {*} message 消息, 将会以次要消息显示到控制台
 */
export default async function logger(req, query, message) {
  let ip = req.ip
  let time = new Date().toLocaleTimeString()
  let path = decodeURIComponent(req.originalUrl.split('?')[0])
  let user = getUserName(ip)
  let typeLog = ' ' + req.method + ' '
  typeLog = (() => {
    switch (req.method) {
      case 'GET':
        return typeLog = chalk.bgGreen(typeLog)
      case 'POST':
        return typeLog = chalk.bgBlue(typeLog)
      default:
        return typeLog = chalk.bgGray(typeLog)
    }
  })()

  // 如果有用户名上报, 暂存至内存
  try {
    if (query.toString().startsWith('u_')) { // 上报 u_ 时
      let userName = query.toString().replace('u_', '')
      let userTag = `${userName}(${req.body?.value?.v || '?'})`
      saveUserName(ip, userTag)
      user = userTag
    }
  } catch (error) {
    console.error('暂存 IP ID 时出错: ', error);
  }

  try {
    dbQuery(
      'INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)',
      [JSON.stringify(query), path, '', JSON.stringify(message), user || ip]
    )
  } catch (error) {
    console.error(error);
  }

  console.log(
    chalk.green('=>'),
    chalk.dim(time),
    chalk.bgBlueBright(` ${counter(ip)} `),
    chalk.dim(user || ip),
    typeLog + chalk.bgGrey(` ${path} `),
    query,
    chalk.dim(JSON.stringify(message))
  )

  // let useUCounter = key.startsWith('u_') // u_ 开头的 key 单独使用一个计数器***

  // if (type != 'UNKNOW') {
  //   dbQuery(
  //     'INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)',
  //     [key, type, code, message, ip]
  //   )
  // }

  // let typeLog = ' ' + type + ' '
  // typeLog = (() => {
  //   switch (type) {
  //     case 'GET':
  //       return typeLog = chalk.bgGreen(typeLog)
  //     case 'POST':
  //       return typeLog = chalk.bgBlue(typeLog)
  //     default:
  //       return typeLog = chalk.bgGray(typeLog)
  //   }
  // })()

  // // Code Color
  // let codeLog = ' ' + code + ' '
  // codeLog = (() => {
  //   switch (code) {
  //     case 200:
  //       return chalk.bgGreen(codeLog)
  //     case 400:
  //     case 401:
  //     case 403:
  //     case 404:
  //       return chalk.bgYellow(codeLog)
  //     case 500:
  //     case 503:
  //       return chalk.bgRed(codeLog)
  //     default:
  //       return chalk.bgGray(codeLog)
  //   }
  // })()

  // let log = {
  //   time: chalk.dim(new Date().toLocaleTimeString()) + ' ',
  //   counter:
  //     useUCounter ?
  //       chalk.bgYellow(` ${counter(ip, 'u_')} `) + ' ' :
  //       chalk.bgBlueBright(` ${counter(ip)} `) + ' ',
  //   ip: chalk.dim(ip) + ' ',
  //   typeAndKey: typeLog + codeLog + ' ' + (key ? key : '') + ' ',
  //   result: chalk.dim(message)
  // }

  // console.log(log.time + log.counter + log.ip + log.typeAndKey + log.result);

}
