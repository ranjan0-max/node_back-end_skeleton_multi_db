const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateCustomError } = require("./error.helper");

const SALT_ROUNDS = 10; // ~75ms per hash, OWASP minimum is 10 (old hashes with 12 still work)
const JWT_ALGORITHM = "HS256";

/**
 * @description generates hashed password for plain password
 * @param password string: password provided by user
 * @returns hashed password
 */
async function generateHash(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * @description compares provided password with hash, throws if not matched
 * @param userPassword string: password provided by user
 * @param hash string: password hash from database
 * @returns true
 */
async function compareHash(userPassword, hash) {
  const match = await bcrypt.compare(userPassword, hash);

  if (!match)
    generateCustomError("incorrect username or password", "auth_error", 401, "invalidCredentials");

  return true;
}

/**
 * @description generates json web token with expiry time
 * @param data object: payload (never put password / secrets here)
 * @param time token expiry time {'15m', '1h', '7d', 60*60}
 * @param secret secret key to sign jwt
 * @returns jwt
 */
function generateToken(data, time, secret) {
  return jwt.sign(data, secret, { expiresIn: time, algorithm: JWT_ALGORITHM });
}

/**
 * @description verifies token signature + expiry, throws 401 if invalid
 * @param token jwt token
 * @param secret jwt secret
 * @returns token payload
 */
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] });
  } catch (error) {
    if (error.name === "TokenExpiredError")
      generateCustomError("token expired !", "auth_token_error", 401, "authTokenExpired");

    generateCustomError("invalid token !", "auth_token_error", 401, "authTokenInvalid");
  }
}

/**
 * @description extracts Bearer token from request headers
 * @param request fastify request object
 * @returns token
 */
function extractToken(request) {
  const { authorization } = request.headers;

  if (!authorization)
    generateCustomError("malformed authorization !", "auth_error", 401, "invalidHeader");

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token)
    generateCustomError("malformed authorization !", "auth_error", 401, "noBearer");

  return token;
}

module.exports = {
  generateHash,
  compareHash,
  generateToken,
  verifyToken,
  extractToken,
};
