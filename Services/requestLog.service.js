const { readLogs, listLogDates } = require("../Helpers/fileLog.helper");

/**
 * @description "request completed" lines of logs/app.<date>.log -> simple objects for frontend
 */
async function readRequestLogs(date) {
  const lines = await readLogs("app", date, (line) => line.msg === "request completed");

  return lines.map((line) => ({
    time: line.time,
    timeIST: line.timeIST,
    method: line.method,
    route: line.route,
    url: line.url,
    statusCode: line.statusCode,
    durationMs: line.durationMs,
    slow: line.slow,
    requestId: line.reqId || null,
    clientId: line.clientId || null,
    clientSlug: line.clientSlug || null,
    userId: line.userId || null,
  }));
}

/**
 * @description requests of one day (default today), latest first
 * optional filters: slowOnly, minDurationMs, method, route, statusCode, clientId
 */
async function list({
  date = new Date().toLocaleDateString("en-CA"), // today (server timezone, same as log file names)
  page = 1,
  limit = 10,
  slowOnly,
  minDurationMs,
  method,
  route,
  statusCode,
  clientId,
}) {
  const logs = (await readRequestLogs(date)).filter(
    (log) =>
      (!slowOnly || log.slow) &&
      (!minDurationMs || log.durationMs >= minDurationMs) &&
      (!method || log.method === method) &&
      (!route || log.route === route) &&
      (!statusCode || log.statusCode === statusCode) &&
      (!clientId || log.clientId === clientId)
  );

  const skip = (page - 1) * limit;

  return { rows: logs.slice(skip, skip + limit), count: logs.length };
}

/**
 * @description per endpoint stats of a day, slowest (avg) first
 * -> tells which endpoint needs optimization
 */
async function summary({ date = new Date().toLocaleDateString("en-CA") }) {
  const groups = new Map();

  (await readRequestLogs(date)).forEach((log) => {
    const key = `${log.method} ${log.route || "(not found)"}`;
    if (!groups.has(key)) groups.set(key, { method: log.method, route: log.route, logs: [] });
    groups.get(key).logs.push(log);
  });

  return [...groups.values()]
    .map(({ method, route, logs }) => {
      const durations = logs.map((log) => log.durationMs).sort((a, b) => a - b);
      const total = durations.reduce((sum, duration) => sum + duration, 0);

      return {
        method,
        route,
        count: logs.length,
        avgMs: Math.round((total / logs.length) * 100) / 100,
        minMs: durations[0],
        maxMs: durations[durations.length - 1],
        p95Ms: durations[Math.ceil(durations.length * 0.95) - 1], // 95% requests are faster than this
        slowCount: logs.filter((log) => log.slow).length,
        errorCount: logs.filter((log) => log.statusCode >= 500).length,
      };
    })
    .sort((a, b) => b.avgMs - a.avgMs);
}

/**
 * @description dates which have log files, for date dropdown on frontend
 */
async function dates() {
  return listLogDates("app");
}

module.exports = { list, summary, dates };
