import dbQuery from "../tools/dbQuery.js";
import chalk from "chalk";

let ipCounter = {}
let uCounter = {}

export default async function logger(key, type, code = '', message = '', ip = '') {

  let useUCounter = key.startsWith('u_')
  if (useUCounter) { // u_ 开头的 key 单独使用一个计数器
    if (!uCounter[ip]) uCounter[ip] = 1
    else uCounter[ip]++
  } else {
    if (!ipCounter[ip]) ipCounter[ip] = 1
    else ipCounter[ip]++
  }

  if (type != 'UNKNOW') {
    dbQuery(
      'INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)',
      [key, type, code, message, ip]
    )
  }
  let typeLog
  switch (type) {
    case 'GET':
    case 'GET+':
      typeLog = chalk.bgGreen(' ' + type + ' ')
      break;
    case 'POST':
      typeLog = chalk.bgBlue(' ' + type + ' ')
      break;
    default:
      typeLog = chalk.bgGray(' ' + type + ' ')
      break;
  }
  let codeLog
  switch (code) {
    case 200:
      codeLog = chalk.bgGreen(' ' + code + ' ')
      break;
    case 404:
    case 400:
      codeLog = chalk.bgYellow(' ' + code + ' ')
      break;
    case 500:
      codeLog = chalk.bgRed(' ' + code + ' ')
      break;
    default:
      codeLog = chalk.bgGray(' ' + code + ' ')
      break;
  }

  let log = {
    time: chalk.dim(new Date().toLocaleTimeString()) + ' ',
    counter:
      useUCounter ?
        chalk.bgYellowBright(` ${uCounter[ip]} `) + ' ' :
        chalk.bgBlueBright(` ${ipCounter[ip]} `) + ' ',
    ip: chalk.dim(ip) + ' ',
    typeAndKey: typeLog + codeLog + ' ' + (key ? key : '') + ' ',
    result: chalk.dim(message)
  }

  console.log(log.time + log.counter + log.ip + log.typeAndKey + log.result);

}
