require("dotenv").config({ quiet: true });

//? stop at start if any required env variable is missing
const REQUIRED_ENV = [
  "NODE_ENV",
  "PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) throw new Error(`Missing env variables: ${missingEnv.join(", ")}`);

const app = require("./app");
const Logger = require("./Helpers/logger.helper");
const { IST } = require("./Helpers/dateTime.helper");
const { sequelize } = require("./Database/connection");
const { runAllMigrations } = require("./Database/migrator");

const { PORT, HOST, NODE_ENV, RUN_MIGRATIONS_ON_START, DB_NAME, DB_HOST } = process.env;

/**
 * @description start order: DB connect -> migrations -> start listening
 * if any step fails, app is killed (pm2 will show it as errored)
 */
async function startServer() {
  await sequelize.authenticate(); // throws if DB is not reachable
  Logger.info(`Database connected [${DB_NAME}@${DB_HOST}]`);

  if (RUN_MIGRATIONS_ON_START === "true") await runAllMigrations();

  await app.listen({ port: Number(PORT) || 1310, host: HOST || "0.0.0.0" });

  Logger.info(
    `server started on port: [${PORT}] with [${NODE_ENV.toUpperCase()} --env] [${IST("date")} ${IST("time")}]`
  );
}

const SHUTDOWN_TIMEOUT_MS = 10000;
let isShuttingDown = false;

/**
 * @description on pm2 restart / ctrl+c / crash -> finish running requests, close DB, then exit
 * @param reason why shutting down (SIGINT, SIGTERM, uncaughtException)
 * @param exitCode 0 = normal stop, 1 = crash (pm2 restarts in both cases)
 */
async function shutdown(reason, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  Logger.info(`${reason} received, shutting down...`);

  //? if closing hangs, force exit so pm2 can restart
  setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();

  try {
    await app.close();
    await sequelize.close();
    Logger.info("Database connection closed");
    process.exit(exitCode); // pino writes pending log lines to files on exit
  } catch (error) {
    Logger.error(error, "Error during shutdown");
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

//? unexpected errors outside a request (timers, cron, events) -> also in logs/error.<date>.log
process.on("unhandledRejection", (error) => {
  Logger.error({ err: error, source: "unhandledRejection" }, "Unhandled rejection");
});

process.on("uncaughtException", (error) => {
  Logger.fatal(
    { err: error, source: "uncaughtException" },
    "Uncaught exception, app state may be broken -> restarting"
  );
  shutdown("uncaughtException", 1);
});

startServer().catch((error) => {
  Logger.error(error, "Unable to start server, Killing app :/(");
  process.exit(1);
});
