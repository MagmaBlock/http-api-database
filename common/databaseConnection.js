import mysql from 'mysql2';
import config from './config.js';

const db = mysql.createPool(config.mysql);
console.log('[启动信息] 已创建数据库连接池');


// 如果表不存在建表
let createTableIfNotExist =
  [
    `CREATE TABLE IF NOT EXISTS main (
    \`key\` varchar(100) NOT NULL,
    \`value\` mediumtext,
    \`update_time\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY \`main_un\` (\`key\`)
    ) DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`log\` (
      \`key\` varchar(100) NOT NULL,
      \`type\` varchar(100) NOT NULL,
      \`code\` varchar(100) NOT NULL,
      \`message\` varchar(100) DEFAULT NULL,
      \`time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`ip\` varchar(100) DEFAULT NULL
    ) DEFAULT CHARSET=utf8mb4;`
  ]

for (let i in createTableIfNotExist) {

  db.query(
    createTableIfNotExist[i],
    function (err, results, fields) {
      if (err) {
        console.log(err.message);
      }
    }
  )

}

export default db;