const ErrorLogController = require("../Controllers/errorLog.controller");
const ErrorLogValidator = require("../Validators/errorLog.validator");
const { authenticate } = require("../Middleware/auth.middleware");
const { authorize } = require("../Middleware/role.middleware");
const { ROLES } = require("../Helpers/constants.helper");

//? /api/v1/error-logs -> only super admin, reads logs/error.<date>.log files
module.exports = async function errorLogRoutes(app) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authorize(ROLES.SUPER_ADMIN));

  app.get("/", { schema: ErrorLogValidator.list }, ErrorLogController.list);
  app.get("/dates", ErrorLogController.dates);
};
