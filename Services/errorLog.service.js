const { readLogs, listLogDates } = require("../Helpers/fileLog.helper");

/**
 * @description pino line of logs/error.<date>.log -> simple object for frontend
 */
const toErrorLog = (line) => ({
  time: line.time,
  timeIST: line.timeIST,
  level: line.level >= 60 ? "fatal" : "error",
  source: line.source || null,
  message: line.err?.message || line.msg || null,
  stack: line.err?.stack || null,
  requestId: line.reqId || null,
  method: line.method || null,
  url: line.url || null,
  clientId: line.clientId || null,
  clientSlug: line.clientSlug || null,
  userId: line.userId || null,
  role: line.role || null,
  requestBody: line.requestBody || null,
});

/**
 * @description errors of one day (default today), latest first
 * optional filters: source, clientId, userId
 */
async function list({
  date = new Date().toLocaleDateString("en-CA"),
  page = 1,
  limit = 10,
  source,
  clientId,
  userId,
}) {
  const logs = (await readLogs("error", date))
    .map(toErrorLog)
    .filter(
      (log) =>
        (!source || log.source === source) &&
        (!clientId || log.clientId === clientId) &&
        (!userId || log.userId === userId)
    );

  const skip = (page - 1) * limit;

  return { rows: logs.slice(skip, skip + limit), count: logs.length };
}

/**
 * @description dates which have error log files, for date dropdown on frontend
 */
async function dates() {
  return listLogDates("error");
}

module.exports = { list, dates };
