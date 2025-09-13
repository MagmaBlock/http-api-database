import { isAppUA } from "../src/utils/ua.js";

export function requireAppUA(req, res, next) {
  const userAgent = req.headers["user-agent"];

  if (!isAppUA(userAgent)) {
    return res.send({ code: 400, message: "请求格式有误" });
  }
  next();
}
