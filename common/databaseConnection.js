import mysql from 'mysql2';
import config from './config.js';

const db = mysql.createPool(config.mysql);
const promiseDB = db.promise(); // mysql2 promise api
export default db;
export { promiseDB };
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
    ) DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`online\` (
      \`user_id\` varchar(100) NOT NULL,
      \`last_online\` timestamp NULL DEFAULT NULL,
      UNIQUE KEY \`online_un\` (\`user_id\`)
    ) DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`collect\` (
      \`user_id\` varchar(100) NOT NULL,
      \`topic_id\` varchar(100) NOT NULL,
      \`create_time\` timestamp NULL DEFAULT CURRENT_TIMESTAMP
    ) DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`nsfw\` (
      \`subject_id\` varchar(100) NOT NULL,
      \`name\` varchar(100) NULL,
      \`blocked\` BOOL NOT NULL,
      \`score\` tinyint NULL,      
      \`unknown\` tinyint(1) DEFAULT NULL,
      \`create_time\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT nsfw_un UNIQUE KEY (subject_id)
    ) DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS \`temp_file\` (
      \`key\` varchar(100) NOT NULL,
      \`file_name\` tinytext,
      \`file_content\` mediumtext,
      \`expire_time\` timestamp,
      \`forever\` tinyint(1) NOT NULL DEFAULT '0',
      UNIQUE KEY \`temp_file_un\` (\`key\`)
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
