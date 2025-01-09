import "dotenv/config";

const { REVERSE_PROXY, DATABASE_URL, LOG_RETENTION_DAYS, PORT, REDIS_URL } = process.env;

const config = {
  databaseUrl: DATABASE_URL,
  redisUrl: REDIS_URL,
  port: parseInt(PORT) || 7090,
  reverseProxy: REVERSE_PROXY === "false" ? false : true,
  logRetentionDays: parseInt(LOG_RETENTION_DAYS) || 7,
};

export default config;
