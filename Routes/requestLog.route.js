const RequestLogController = require("../Controllers/requestLog.controller");
const RequestLogValidator = require("../Validators/requestLog.validator");
const { authenticate } = require("../Middleware/auth.middleware");
const { authorize } = require("../Middleware/role.middleware");
const { ROLES } = require("../Helpers/constants.helper");

//? /api/v1/request-logs -> only super admin, reads logs/app.<date>.log files
module.exports = async function requestLogRoutes(app) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authorize(ROLES.SUPER_ADMIN));

  app.get("/", { schema: RequestLogValidator.list }, RequestLogController.list);
  app.get("/summary", { schema: RequestLogValidator.summary }, RequestLogController.summary);
  app.get("/dates", RequestLogController.dates);
};
