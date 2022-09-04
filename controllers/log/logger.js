import dbQuery from "../tools/dbQuery.js";

export default async function logger(key, type, code = '', message = '', ip = '') {

  if (typeof key !== 'string' || typeof type !== 'string' || typeof message !== 'string' || typeof ip !== 'string') {
    console.error('对 logger 提供的参数不正确或未提供')
  }

  dbQuery(
    'INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)',
    [key, type, code, message, ip]
  )

  console.log(`[${new Date().toLocaleTimeString()}][${type}${code ? ' ' + code : ''}]${ip ? ' ' + ip : ''}${message ? ' ' + message : ''}`)

}
