/*
  新安装时, 在同目录下创建一份 config.js,
  使用本文件的内容即可
*/
import defaultConfig from './defaultConfig.js'

export default {
  // 引入默认设置, 如果版本更新后此文件未更新将会从默认引用. 请勿删改此项
  ...defaultConfig,
  // 启用此模式后将能够支持由 Nginx 反向代理的客户端 IP 显示，若程序未被 Nginx 反代可能会被有心人士伪造访问 IP
  nginxMode: true,
  // MySQL
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'HTTPDB',
    database: 'httpdb',
    password: 'httpdb',
    charset: 'utf8mb4' // 支持 utf8mb4 编码，支持 Emoji
  },
  // 日志删除时间, 默认为 7 天前. 最右侧的值为天
  logDeleteTime: 1000 * 60 * 60 * 24 * 7 // ← 天, (ms)
}