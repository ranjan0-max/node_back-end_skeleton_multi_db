/**
 * @description every route file is registered here with its prefix
 * new module -> create xyz.route.js and add one line below
 */
module.exports = async function routes(app) {
  app.get("/health", async () => ({ success: true, message: "server is running" }));

  app.register(require("./auth.route"), { prefix: "/auth" });
  app.register(require("./client.route"), { prefix: "/clients" });
  app.register(require("./user.route"), { prefix: "/users" });
  app.register(require("./errorLog.route"), { prefix: "/error-logs" });
  app.register(require("./requestLog.route"), { prefix: "/request-logs" });
};
