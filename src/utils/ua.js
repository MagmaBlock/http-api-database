/**
 * 判断请求的 User-Agent 是否是 czy0729/Bangumi/* 格式的客户端
 * @param {object} req Express 的请求对象
 * @returns {boolean} 如果是 czy0729/Bangumi/* 格式的客户端，则返回 true，否则返回 false
 */
export function isAppUA(req) {
  const userAgent = req.headers["user-agent"];
  if (!userAgent) {
    return false;
  }
  // 使用正则表达式匹配 czy0729/Bangumi/ 开头，后面可以是任意字符
  const regex = /^czy0729\/Bangumi\/.*/;
  return regex.test(userAgent);
}

export function requireAppUA(req, res, next) {
  if (!isAppUA(req)) {
    res.send({ code: 400, message: "请求格式有误" });
  }
}
