const path = require("node:path");
const pino = require("pino");
const { IST } = require("./dateTime.helper");

const { NODE_ENV, LOG_LEVEL, LOG_DIR, LOG_RETENTION_DAYS, NODE_APP_INSTANCE } = process.env;

const isDevelopment = NODE_ENV !== "production";
const level = LOG_LEVEL || "info";
const logDir = path.resolve(__dirname, "..", LOG_DIR || "logs");
const retentionDays = Number(LOG_RETENTION_DAYS) || 7;

//? pm2 cluster -> every instance gets its own files (app-0..., app-1...) so they never clash
const instanceSuffix = NODE_APP_INSTANCE !== undefined ? `-${NODE_APP_INSTANCE}` : "";

/**
 * @description pino-roll target -> new file every day: logs/<name>.YYYY-MM-DD.<n>.log
 * keeps last LOG_RETENTION_DAYS files, older are deleted automatically
 */
const dailyFile = (name, targetLevel) => ({
  target: "pino-roll",
  level: targetLevel,
  options: {
    file: path.join(logDir, `${name}${instanceSuffix}`),
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    mkdir: true,
    limit: { count: retentionDays - 1, removeOtherLogFiles: true }, // + today's file = retentionDays
  },
});

const consoleTarget = isDevelopment
  ? {
      target: "pino-pretty",
      level,
      options: { colorize: true, translateTime: "SYS:dd-mm-yyyy HH:MM:ss", ignore: "timeIST" },
    }
  : { target: "pino/file", level, options: { destination: 1 } }; // stdout (pm2 logs)

/**
 * @description single app-wide logger, also used by fastify (request.log)
 * console + logs/app.<date>.log (everything) + logs/error.<date>.log (only errors)
 */
const Logger = pino(
  {
    level,
    redact: ["req.headers.authorization", "req.headers.cookie"],
    timestamp: () => `,"time":"${new Date().toISOString()}","timeIST":"${IST()}"`,
  },
  pino.transport({
    targets: [consoleTarget, dailyFile("app", level), dailyFile("error", "error")],
  })
);

module.exports = Logger;
