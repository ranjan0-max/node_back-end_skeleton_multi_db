const { verifyToken } = require("../Helpers/auth.helper");

/**
 * @description who is counted for rate limit
 * logged in  -> per user, so many users behind one office / college wifi (same IP) are not blocked
 * not logged in (login, refresh...) -> per IP
 * token is verified, so nobody can bypass the limit with fake tokens
 */
function rateLimitKey(request) {
  const [scheme, token] = (request.headers.authorization || "").split(" ");

  if (scheme === "Bearer" && token) {
    try {
      return `user:${verifyToken(token, process.env.JWT_ACCESS_SECRET).userId}`;
    } catch {
      // invalid / expired token -> counted by IP below
    }
  }

  return `ip:${request.ip}`;
}

module.exports = { rateLimitKey };
