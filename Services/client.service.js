const { sequelize } = require("../Database/connection");
const { Client, User, Role } = require("../Database/Models");
const { runUp } = require("../Database/migrator");
const { isUnique, create, read, findManyDetails } = require("../Helpers/crud.helper");
const { generateHash } = require("../Helpers/auth.helper");
const { withTransaction } = require("../Helpers/transaction.helper");
const { ROLES } = require("../Helpers/constants.helper");
const Logger = require("../Helpers/logger.helper");

const SCHEMA_PREFIX = "tenant_";
const CLIENT_FIELDS = ["id", "name", "slug", "schemaName", "isActive"];

/**
 * @description creates a new client in ONE transaction:
 * 1. public.clients row  2. new schema  3. common tenant migrations  4. client admin user
 * any step fails -> everything rolled back (postgres rolls back CREATE SCHEMA / TABLE too)
 * tenant seeders are not run here -> "npm run db:seed -- tenant <schema>"
 */
async function createClient({ name, slug, adminName, adminEmail, adminPassword }) {
  const schemaName = `${SCHEMA_PREFIX}${slug}`;
  const password = await generateHash(adminPassword); // slow, so done before transaction

  const client = await withTransaction(async () => {
    await isUnique(Client, { slug });
    await isUnique(User, { email: adminEmail });

    const adminRole = await read(Role, { name: ROLES.ADMIN }, ["id"]);
    const newClient = await create(Client, { name, slug, schemaName });

    await sequelize.createSchema(schemaName);
    await runUp(schemaName, "tenantMigrations");

    await create(User, {
      clientId: newClient.id,
      roleId: adminRole?.id,
      name: adminName,
      email: adminEmail,
      password,
    });

    return newClient;
  });

  Logger.info(`Client created [${slug}] -> schema [${schemaName}]`);

  return client;
}

async function list({ page = 1, limit = 10 }) {
  return findManyDetails(Client, {}, "AND", CLIENT_FIELDS, [], [["id", "DESC"]], {
    skip: (page - 1) * limit,
    limit,
  });
}

module.exports = { createClient, list };
