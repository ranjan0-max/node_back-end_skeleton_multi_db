const Fastify = require("fastify");
const helmet = require("@fastify/helmet");
const cors = require("@fastify/cors");
const cookie = require("@fastify/cookie");
const formbody = require("@fastify/formbody");
const rateLimit = require("@fastify/rate-limit");

const Logger = require("./Helpers/logger.helper");
const Response = require("./Helpers/response.helper");
const { tenantStorage } = require("./Helpers/tenantContext.helper");
const { requestLogger } = require("./Middleware/requestLog.middleware");
const { rateLimitKey } = require("./Middleware/rateLimit.middleware");
const { HandleError } = require("./Middleware/errorHandler.middleware");

const { BODY_LIMIT_MB, CORS_URLS, TRUST_PROXY, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW } = process.env;

const app = Fastify({
  loggerInstance: Logger,
  disableRequestLogging: true, // our own "request completed" line (Middleware/requestLog)
  bodyLimit: (Number(BODY_LIMIT_MB) || 10) * 1024 * 1024,
  trustProxy: TRUST_PROXY === "true",
});

// ! request security
app.register(helmet);
app.register(cors, {
  origin: (CORS_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  exposedHeaders: ["x-server-errortype"],
});
app.register(rateLimit, {
  max: Number(RATE_LIMIT_MAX) || 100,
  timeWindow: RATE_LIMIT_WINDOW || "1 minute",
  keyGenerator: rateLimitKey, // per user after login, per IP before login
});

//? body parsers (json is built-in)
app.register(formbody);
app.register(cookie);

//? every request gets its own empty tenant context (filled by auth middleware)
//? so two parallel requests of different clients never mix
app.addHook("onRequest", (request, reply, done) => tenantStorage.run({ tenant: null }, done));

//? after response -> method, route, status, time taken in logs/app.<date>.log
app.addHook("onResponse", requestLogger);

//? error handlers
app.setErrorHandler(HandleError);
app.setNotFoundHandler((request, reply) =>
  Response.notFound(reply, { message: `Route ${request.method} ${request.url} not found` })
);

//? routes
app.register(require("./Routes"));

module.exports = app;
