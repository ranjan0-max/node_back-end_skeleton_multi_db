const AuthRoute = require("./auth.route");
const ClientRoute = require("./client.route");
const UserRoute = require("./user.route");
const MenuRoute = require("./menu.route");
const ErrorLogRoute = require("./errorLog.route");
const RequestLogRoute = require("./requestLog.route");

/**
 * @description every route file is registered here with its full prefix
 * new module -> create xyz.route.js, require it above and add one line below
 */
module.exports = async function routes(app) {
  app.get("/api/v1/health", async () => ({ success: true, message: "server is running" }));

  app.register(AuthRoute, { prefix: "/api/v1/auth" });
  app.register(ClientRoute, { prefix: "/api/v1/clients" });
  app.register(UserRoute, { prefix: "/api/v1/users" });
  app.register(MenuRoute, { prefix: "/api/v1/menus" });
  app.register(ErrorLogRoute, { prefix: "/api/v1/error-logs" });
  app.register(RequestLogRoute, { prefix: "/api/v1/request-logs" });
};
