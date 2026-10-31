const ClientController = require("../Controllers/client.controller");
const ClientValidator = require("../Validators/client.validator");
const MenuController = require("../Controllers/menu.controller");
const MenuValidator = require("../Validators/menu.validator");
const { authenticate } = require("../Middleware/auth.middleware");
const { authorize } = require("../Middleware/role.middleware");
const { ROLES } = require("../Helpers/constants.helper");

module.exports = async function clientRoutes(app) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authorize(ROLES.SUPER_ADMIN));

  app.get("/", { schema: ClientValidator.list }, ClientController.list);
  app.post("/", { schema: ClientValidator.create }, ClientController.create);

  app.get("/:id/menus", { schema: MenuValidator.getClientMenus }, MenuController.getClientMenus);
  app.put("/:id/menus", { schema: MenuValidator.setClientMenus }, MenuController.setClientMenus);
};
