import axios from "axios";

export const BangumiAPI = axios.create({
  baseURL: "https://api.bgm.tv",
  headers: { "User-Agent": "magmablock/bangumi-app-db" },
});
