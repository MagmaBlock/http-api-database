import db from "../../common/databaseConnection.js";

export default function dbQuery(sql, values) {
  return new Promise(function (resolve, reject) {
      db.query(
          sql,
          values,
          function (err, result) {
              if (err) {
                  reject(err);
              } else {
                  resolve(result);
              }
          }
      )
  })
}