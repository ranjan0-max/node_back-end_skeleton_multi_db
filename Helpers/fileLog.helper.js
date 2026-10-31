const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const LOG_DIR = path.resolve(__dirname, "..", process.env.LOG_DIR || "logs");

//? files written by pino-roll: app.2026-10-29.1.log, error-0.2026-10-29.2.log (pm2 cluster)
const LOG_FILE = /^([a-z]+)(?:-\d+)?\.(\d{4}-\d{2}-\d{2})\.\d+\.log$/;

async function logFiles() {
  const files = await fs.promises.readdir(LOG_DIR).catch(() => []);

  return files
    .map((file) => ({ file, match: file.match(LOG_FILE) }))
    .filter(({ match }) => match)
    .map(({ file, match }) => ({ file, type: match[1], date: match[2] }));
}

/**
 * @description log lines of a type ("app" | "error") + date, latest first, [] if no file
 * reads line by line (async) -> big files never block other requests
 * @param keep optional filter, only matching lines are kept in memory
 */
async function readLogs(type, date, keep = () => true) {
  const lines = [];
  const files = (await logFiles()).filter((log) => log.type === type && log.date === date);

  for (const { file } of files) {
    const input = fs.createReadStream(path.join(LOG_DIR, file), "utf8");

    for await (const text of readline.createInterface({ input, crlfDelay: Infinity })) {
      if (!text) continue;

      try {
        const line = JSON.parse(text);
        if (keep(line)) lines.push(line);
      } catch {
        // half written line (app crashed while writing) -> skip
      }
    }
  }

  return lines.sort((a, b) => (a.time < b.time ? 1 : -1));
}

/**
 * @description dates which have a log file of this type, latest first
 */
async function listLogDates(type) {
  const dates = (await logFiles()).filter((log) => log.type === type).map((log) => log.date);

  return [...new Set(dates)].sort().reverse();
}

module.exports = { readLogs, listLogDates };
