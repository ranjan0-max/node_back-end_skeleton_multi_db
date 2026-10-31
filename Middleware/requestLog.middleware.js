const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS) || 1000;
const isEnabled = process.env.REQUEST_LOG_ENABLED !== "false";

/**
 * @description runs after response is sent -> one "request completed" line with time taken
 * (replaces fastify's default request logs, adds route pattern + slow flag)
 * slow request -> "warn" level so it stands out in console
 */
function requestLogger(request, reply, done) {
  if (isEnabled) {
    const durationMs = Math.round(reply.elapsedTime * 100) / 100;
    const slow = durationMs >= SLOW_REQUEST_MS;

    request.log[slow ? "warn" : "info"](
      {
        method: request.method,
        route: request.routeOptions?.url || null, // pattern e.g. /api/v1/users/:id (null = 404)
        url: request.url,
        statusCode: reply.statusCode,
        durationMs,
        slow,
      },
      "request completed"
    );
  }

  done();
}

module.exports = { requestLogger };
