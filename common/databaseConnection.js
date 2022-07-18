import mysql from 'mysql';
import config from './config.js';

const db = mysql.createConnection(config.mysql);

function connect() {
  db.connect(
    (error) => {
      if (error) {
        console.error(error)
        console.error('[数据库] 连接数据库时发生错误')
        return;
      }
      console.log('[数据库] 成功连接到数据库')
    }
  )
}
connect();


// 如果表不存在建表
let createTableIfNotExist =
  `create table if not exists main(
    \`key\` varchar(100) NOT NULL,
    \`value\` mediumtext,
    UNIQUE KEY \`main_un\` (\`key\`)
  )`
db.query(
  createTableIfNotExist,
  function (err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  }
)

export default db;