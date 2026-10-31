const UserController = require("../Controllers/user.controller");
const UserValidator = require("../Validators/user.validator");
const { authenticate } = require("../Middleware/auth.middleware");
const { authorize } = require("../Middleware/role.middleware");
const { ROLES } = require("../Helpers/constants.helper");

//? /api/v1/users
module.exports = async function userRoutes(app) {
  app.addHook("preHandler", authenticate);

  app.get(
    "/",
    { schema: UserValidator.list, preHandler: authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN) },
    UserController.list
  );
  app.get(
    "/:id",
    { schema: UserValidator.getById, preHandler: authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN) },
    UserController.getById
  );
  app.post(
    "/",
    { schema: UserValidator.create, preHandler: authorize(ROLES.ADMIN) },
    UserController.create
  );
};
