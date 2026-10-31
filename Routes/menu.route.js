const MenuController = require("../Controllers/menu.controller");
const MenuValidator = require("../Validators/menu.validator");
const { authenticate } = require("../Middleware/auth.middleware");
const { authorize } = require("../Middleware/role.middleware");
const { ROLES } = require("../Helpers/constants.helper");

//? /api/v1/menus -> /my for every logged in user, rest only super admin
module.exports = async function menuRoutes(app) {
  app.addHook("preHandler", authenticate);

  app.get("/my", MenuController.my);

  const superAdmin = { preHandler: authorize(ROLES.SUPER_ADMIN) };

  app.get("/", superAdmin, MenuController.list);
  app.get("/:id", { ...superAdmin, schema: MenuValidator.getById }, MenuController.getById);
  app.post("/", { ...superAdmin, schema: MenuValidator.create }, MenuController.create);
  app.put("/:id", { ...superAdmin, schema: MenuValidator.update }, MenuController.update);
  app.delete("/:id", { ...superAdmin, schema: MenuValidator.remove }, MenuController.remove);
};
