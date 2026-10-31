require("dotenv").config({ quiet: true });

const Logger = require("../Helpers/logger.helper");
const { sequelize } = require("./connection");
const { PUBLIC_SCHEMA, runUp, getTenantSchemas } = require("./migrator");

const HELP = `
Usage:
  npm run db:seed -- public                 run public seeders
  npm run db:seed -- tenant <schema|all>    run tenant seeders on one / every client schema
`;

/**
 * @description "public" -> ["public"], "tenant all" -> every client schema, "tenant x" -> ["x"]
 */
async function resolveSchemas(type, schema) {
  if (type === "public") return [PUBLIC_SCHEMA];
  if (type !== "tenant") throw new Error("type must be 'public' or 'tenant'");
  if (!schema) throw new Error("tenant schema name required (or 'all')");
  if (schema === "all") return getTenantSchemas();
  return [schema];
}

async function main() {
  const [type, schema] = process.argv.slice(2);

  if (!type) return console.log(HELP);

  //? runs pending seeders (each seeder runs only once per schema)
  for (const name of await resolveSchemas(type, schema)) await runUp(name, `${type}Seeders`);

  await sequelize.close();
}

main().catch(async (error) => {
  Logger.error(error);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
