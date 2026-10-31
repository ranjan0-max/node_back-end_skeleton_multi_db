const { extractToken, verifyToken } = require("../Helpers/auth.helper");
const { tenantStorage } = require("../Helpers/tenantContext.helper");
const AuthService = require("../Services/auth.service");

/**
 * @description verifies access token + current session and resolves client (tenant schema)
 * after this: request.user = { id, clientId, role }, request.client = { id, slug, schemaName }
 * and getTenantModel("X") anywhere in this request points to that client's schema
 * @example app.addHook("preHandler", authenticate)  // whole route file
 * @example app.get("/", { preHandler: authenticate }, handler)  // single route
 */
async function authenticate(request) {
  const token = extractToken(request);
  const { userId, clientId, role, sessionId } = verifyToken(token, process.env.JWT_ACCESS_SECRET);

  //? ONE query: user + client -> logged in elsewhere / logged out / user or client inactive -> 401
  const user = await AuthService.validateSession(userId, sessionId);

  request.user = { id: userId, clientId, role };

  if (user.client) {
    const { id, slug, schemaName } = user.client;

    request.client = { id, slug, schemaName };
    tenantStorage.getStore().tenant = request.client; // getTenantModel() now uses this schema
  }

  //? every log line of this request now has client + user (request completed, errors...)
  request.log = request.log.child({
    clientId: clientId || null,
    clientSlug: request.client?.slug || null,
    userId,
    role,
  });
}

module.exports = { authenticate };
