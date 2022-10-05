import config from "../../common/config.js"

export default function requestData(req) {
  if (!req) return console.error('未提供 req 对象')

  let requestTime = new Date()
  let requestIp = (req.headers['x-forwarded-for'] && config.nginxMode) ? req.headers['x-forwarded-for'] : req.ip // support nginx proxy

  return {
    time: requestTime.toLocaleString('chinese', { hour12: false }),
    timestamp: requestTime.getTime(),
    ip: requestIp
  }
}