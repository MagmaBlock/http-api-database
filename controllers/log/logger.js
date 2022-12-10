import dbQuery from "../tools/dbQuery.js";
import chalk from "chalk";
import requestData from "../request/requestData.js";

let store = {}
function counter(cKey, cType = 'default') {
  if (!store[cType]) store[cType] = {}
  if (store[cType][cKey]) {
    return ++store[cType][cKey]
  } else {
    return store[cType][cKey] = 1
  }
}



export default async function logger(req, query, message) {
  let ip = requestData(req).ip
  let time = new Date().toLocaleTimeString()
  let path = decodeURIComponent(req.path)
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

  try {
    dbQuery(
      'INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)',
      [JSON.stringify(query), path, '', message, ip]
    )
  } catch (error) {
    console.error(error);
  }

  console.log(
    chalk.green('=>'),
    chalk.dim(time),
    chalk.bgBlueBright(` ${counter(ip)} `),
    chalk.dim(ip),
    typeLog + chalk.bgGrey(` ${path} `),
    query,
    chalk.dim(message)
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
