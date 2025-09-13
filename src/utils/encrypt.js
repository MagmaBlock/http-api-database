import CryptoJS from "crypto-js";
import { APP_ID } from "../constants/app.js";

/** 加密字符串 */
export function set(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), APP_ID).toString();
}

/** 解密字符串 */
export function get(content) {
  const bytes = CryptoJS.AES.decrypt(content.toString(), APP_ID);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
