const crypto = require("node:crypto");
const { User, Role, Client } = require("../Database/Models");
const { read, updateMany } = require("../Helpers/crud.helper");
const { compareHash, generateToken, verifyToken } = require("../Helpers/auth.helper");
const { generateCustomError } = require("../Helpers/error.helper");

const { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY } =
  process.env;

//? user + role + client in ONE query (no separate client query)
const USER_INCLUDE = [
  { model: Role, as: "role", attributes: ["name"] },
  { model: Client, as: "client", attributes: ["id", "slug", "schemaName", "isActive"] },
];

/**
 * @description access + refresh token, payload tells which user, client (schema), role and session
 */
function generateTokens(user, sessionId) {
  const payload = {
    userId: user.id,
    clientId: user.clientId,
    role: user.role?.name || null,
    sessionId,
  };

  return {
    accessToken: generateToken(payload, JWT_ACCESS_EXPIRY || "1h", JWT_ACCESS_SECRET),
    refreshToken: generateToken(payload, JWT_REFRESH_EXPIRY || "7d", JWT_REFRESH_SECRET),
  };
}

/**
 * @description token's session must be the user's current session (one device at a time)
 * user logged in somewhere else / logged out -> 401 sessionExpired
 * also blocks deactivated users / clients immediately (not after token expiry)
 * @returns user with role + client (one query), used by authenticate and refresh
 */
async function validateSession(userId, sessionId) {
  const user = await read(
    User.unscoped(),
    { id: userId },
    ["id", "clientId", "isActive", "sessionId"],
    [],
    USER_INCLUDE
  );

  if (!user?.isActive) generateCustomError("user inactive", "auth_error", 401, "userInactive");

  if (!sessionId || user.sessionId !== sessionId)
    generateCustomError(
      "logged in on another device, please login again",
      "auth_error",
      401,
      "sessionExpired"
    );

  //? super admin has no client
  if (user.clientId && !user.client?.isActive)
    generateCustomError("client inactive", "auth_error", 401, "clientInactive");

  return user;
}

/**
 * @description email is unique in whole system, so client is known from the user itself
 * new login = new session -> previous device is logged out automatically
 * inactive user / client -> clear message, but only after correct password
 * (so nobody can find deactivated accounts by trying emails)
 */
async function login({ email, password }) {
  const user = await read(User.scope("withPassword"), { email }, [], [], USER_INCLUDE);
  if (!user)
    generateCustomError("incorrect username or password", "auth_error", 401, "invalidCredentials");

  await compareHash(password, user.password);

  if (!user.isActive)
    generateCustomError("your account is deactivated", "auth_error", 403, "userInactive");

  if (user.clientId && !user.client?.isActive)
    generateCustomError("client inactive", "auth_error", 401, "clientInactive");

  const sessionId = crypto.randomUUID();
  await updateMany(User, { id: user.id }, { sessionId });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role?.name || null },
    ...generateTokens(user, sessionId),
  };
}

/**
 * @description new token pair from a valid refresh token (same session, user + client active)
 * role is read again from DB, so role changes apply on next refresh
 */
async function refresh({ refreshToken }) {
  const { userId, sessionId } = verifyToken(refreshToken, JWT_REFRESH_SECRET);

  const user = await validateSession(userId, sessionId);

  return generateTokens(user, sessionId);
}

/**
 * @description ends current session -> its access + refresh tokens stop working
 */
async function logout(userId) {
  await updateMany(User, { id: userId }, { sessionId: null });
}

module.exports = { login, refresh, logout, validateSession };
