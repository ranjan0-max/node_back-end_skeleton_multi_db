const { UniqueConstraintError, ValidationError, ForeignKeyConstraintError } = require("sequelize");
const { AppError } = require("../Helpers/error.helper");
const Response = require("../Helpers/response.helper");
const { redact } = require("../Helpers/redact.helper");

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * @description converts any error into { status, errorType, errorCode, message }
 */
function normalizeError(error) {
  if (error instanceof AppError) return error;

  //? fastify schema validation (body / params / query)
  if (error.validation)
    return {
      status: 400,
      errorType: "validation_error",
      errorCode: "invalidInput",
      message: error.message,
    };

  if (error instanceof UniqueConstraintError)
    return {
      status: 409,
      errorType: "conflict_error",
      errorCode: "duplicate",
      message: "Data already exists",
    };

  if (error instanceof ForeignKeyConstraintError)
    return {
      status: 400,
      errorType: "validation_error",
      errorCode: "invalidReference",
      message: "Related data not found",
    };

  if (error instanceof ValidationError)
    return {
      status: 400,
      errorType: "validation_error",
      errorCode: "invalidInput",
      message: error.errors?.[0]?.message || error.message,
    };

  //? fastify / plugin errors (rate limit 429, body too large 413, bad json 400...)
  if (error.statusCode && error.statusCode < 500)
    return {
      status: error.statusCode,
      errorType: "request_error",
      errorCode: error.code || "",
      message: error.message,
    };

  return {
    status: 500,
    errorType: "server_error",
    errorCode: "internalError",
    message: isProduction() ? "Oops! something went wrong" : error.message,
  };
}

/**
 * @description single place where every thrown error becomes a response
 */
function HandleError(error, request, reply) {
  const { status, errorType, errorCode, message } = normalizeError(error);

  if (status >= 500) {
    //? error level -> also goes to logs/error.<date>.log (client / user come from request.log)
    request.log.error(
      {
        err: error,
        source: "request",
        method: request.method,
        url: request.url,
        requestBody: request.body ? redact(request.body) : null,
      },
      error.message
    );
  } else {
    request.log.warn({ errorType, errorCode }, message);
  }

  reply.header("x-server-errortype", errorType);

  return Response.error(reply, { status, message, data: { errorCode } });
}

module.exports = { HandleError };
