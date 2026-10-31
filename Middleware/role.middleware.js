const { generateCustomError } = require("../Helpers/error.helper");

/**
 * @description allows request only for given roles, use after authenticate
 * @example app.post("/", { preHandler: authorize(ROLES.ADMIN) }, handler)
 */
function authorize(...allowedRoles) {
  return async function checkRole(request) {
    if (!allowedRoles.includes(request.user?.role))
      generateCustomError("Forbidden", "auth_error", 403, "permissionDenied");
  };
}

module.exports = { authorize };
