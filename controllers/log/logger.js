import dbQuery from "../tools/dbQuery.js";
import chalk from "chalk";

let ipCounter = {}

export default async function logger(key, type, code = '', message = '', ip = '') {
  if (!ipCounter[ip]) ipCounter[ip] = 1
  else ipCounter[ip]++
  // if (typeof key !== 'string' || typeof type !== 'string' || typeof message !== 'string' || typeof ip !== 'string') {
  //   console.error('对 logger 提供的参数不正确或未提供')
  // }
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
      typeLog = chalk.bgGreen.black(' ' + type + ' ')
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
      codeLog = chalk.bgGreen.black(' ' + code + ' ')
      break;
    case 404:
    case 400:
      codeLog = chalk.bgYellow.black(' ' + code + ' ')
      break;
    case 500:
      codeLog = chalk.bgRed.white(' ' + code + ' ')
      break;
    default:
      codeLog = chalk.bgGray(' ' + code + ' ')
      break;
  }

  let log = {
    time: chalk.dim(new Date().toLocaleTimeString()) + ' ',
    ip: chalk.bgBlueBright(' ' + ipCounter[ip] + ' ') + ' ' + chalk.gray(ip) + ' ',
    typeAndKey: typeLog + codeLog + ' ' + (key ? key : '') + ' ',
    result: chalk.gray(message)
  }

  console.log(log.time + log.ip + log.typeAndKey + log.result);

}
