import dbQuery from "../tools/dbQuery.js";

export default async function logger(key, type, code = '', message = '', ip = '') {

  // if (typeof key !== 'string' || typeof type !== 'string' || typeof message !== 'string' || typeof ip !== 'string') {
  //   console.error('对 logger 提供的参数不正确或未提供')
  // }
  if (type != 'UNKNOW') {
    dbQuery(
      'INSERT INTO log (`key`, `type`, `code`, `message`, `ip`) VALUES (?,?,?,?,?)',
      [key, type, code, message, ip]
    )
  }
  let log = {
    time: `[${new Date().toLocaleTimeString()}]`,
    ip: ip ? `[${ip}]` : '',
    typeAndKey: `[${type}${key ? ' ' + key : ''}]`,
    result: ` ${code} ${message}`
  }
  console.log(log.time + log.ip + log.typeAndKey + log.result);

}
