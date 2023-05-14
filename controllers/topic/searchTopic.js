import { promiseDB } from "../../common/databaseConnection.js";

export async function doSearchAPI(req, res) {
  let { search, withMessage } = req.body;

  let searchResult;
  try {
    if (withMessage) {
      searchResult = await promiseDB.execute(
        "SELECT *, MATCH(title) AGAINST(?) + MATCH(message) AGAINST(?) / 4 AS relevanceScore FROM topic t WHERE MATCH(title) AGAINST(?) OR MATCH(message) AGAINST(?) OR title LIKE CONCAT('%', ?, '%') OR message LIKE CONCAT('%', ?, '%') ORDER BY relevanceScore DESC, `time` DESC LIMIT 0, 20;",
        [search, search, search, search, search, search]
      );
    } else {
      searchResult = await promiseDB.execute(
        "SELECT *, MATCH(title) AGAINST(?) AS relevanceScore FROM topic t WHERE MATCH(title) AGAINST(?) OR title LIKE CONCAT('%', ?, '%') ORDER BY relevanceScore DESC, `time` DESC LIMIT 0, 20;",
        [search, search, search]
      );
    }
    searchResult = searchResult[0];
  } catch (error) {}
  return res.send({ code: 200, message: "", data: searchResult });
}
