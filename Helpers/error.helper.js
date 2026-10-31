/**
 * @description custom error that the error handler understands
 * @param message string: message sent to client
 * @param errorType string: sent in "x-server-errortype" header (e.g. "auth_error")
 * @param status number: http status code
 * @param errorCode string: short code for frontend (e.g. "invalidCredentials")
 */
class AppError extends Error {
  constructor(message, errorType = "server_error", status = 500, errorCode = "") {
    super(message);
    this.name = "AppError";
    this.errorType = errorType;
    this.status = status;
    this.errorCode = errorCode;
  }
}

/**
 * @description throws AppError, use anywhere: controller, service, helper
 * @example generateCustomError("user not found", "not_found", 404, "userNotFound")
 */
function generateCustomError(message, errorType, status, errorCode) {
  throw new AppError(message, errorType, status, errorCode);
}

module.exports = { AppError, generateCustomError };
