const AuthController = require("../Controllers/auth.controller");
const AuthValidator = require("../Validators/auth.validator");
const { authenticate } = require("../Middleware/auth.middleware");

//? /api/v1/auth
module.exports = async function authRoutes(app) {
  app.post("/login", { schema: AuthValidator.login }, AuthController.login);
  app.post("/refresh", { schema: AuthValidator.refresh }, AuthController.refresh);
  app.post("/logout", { preHandler: authenticate }, AuthController.logout);
};
