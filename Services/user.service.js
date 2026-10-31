const { User, Role } = require("../Database/Models");
const { isUnique, create, read, findManyDetails } = require("../Helpers/crud.helper");
const { generateHash } = require("../Helpers/auth.helper");
const { generateCustomError } = require("../Helpers/error.helper");
const { withTransaction } = require("../Helpers/transaction.helper");

const ROLE_INCLUDE = [{ model: Role, as: "role", attributes: ["name"] }];

/**
 * NOTE: clientId = logged in user's client -> a client only sees its own users
 * clientId null (super admin) -> sees all users
 */

async function list({ clientId, page = 1, limit = 10 }) {
  return findManyDetails(
    User,
    clientId ? { clientId } : {},
    "AND",
    [],
    ROLE_INCLUDE,
    [["id", "DESC"]],
    {
      skip: (page - 1) * limit,
      limit,
    }
  );
}

async function getById({ clientId, id }) {
  const user = await read(User, { id, ...(clientId && { clientId }) }, [], [], ROLE_INCLUDE);

  if (!user) generateCustomError("user not found", "not_found", 404, "userNotFound");

  return user;
}

/**
 * @description creates user inside creator's client with given role (admin / user)
 */
async function createUser({ clientId, name, email, password, role }) {
  const hashedPassword = await generateHash(password); // slow, so done before transaction

  return withTransaction(async () => {
    await isUnique(User, { email });

    const userRole = await read(Role, { name: role }, ["id"]);
    if (!userRole) generateCustomError("role not found", "validation_error", 400, "roleNotFound");

    const user = await create(User, {
      clientId,
      roleId: userRole.id,
      name,
      email,
      password: hashedPassword,
    });

    return getById({ clientId, id: user.id }); // re-read so password is not returned
  });
}

module.exports = { list, getById, createUser };
