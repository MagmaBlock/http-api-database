import { set as encrypt } from "../src/utils/encrypt.js";

// 一个安全的 JSON 判断函数
function isJson(str) {
  if (typeof str !== "string" || str.length === 0) {
    return false;
  }
  try {
    const result = JSON.parse(str);
    // 确保解析结果是对象或数组，而不是 null, number, string, boolean
    return typeof result === "object" && result !== null;
  } catch (e) {
    return false;
  }
}

export function encryptResponseBody(req, res, next) {
  const originalSend = res.send;

  res.send = function (body) {
    let dataToEncrypt = null;

    if (typeof body === "object" && body !== null) {
      // 如果 body 本身就是一个对象（通常来自 res.json()）
      dataToEncrypt = body;
    } else if (typeof body === "string" && isJson(body)) {
      // 如果 body 是一个 JSON 字符串
      dataToEncrypt = JSON.parse(body);
    }

    if (dataToEncrypt) {
      const encryptedBody = encrypt(dataToEncrypt);

      // 设置响应头，告诉客户端内容是加密后的文本
      res.setHeader("Content-Type", "text/plain; charset=utf-8");

      // 调用原始的 send 方法发送加密后的数据
      return originalSend.call(this, encryptedBody);
    }

    // 如果不是 JSON，直接发送原始 body
    return originalSend.call(this, body);
  };

  next();
}
