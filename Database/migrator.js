const fs = require("node:fs");
const path = require("node:path");
const { Umzug } = require("umzug");
const { Sequelize } = require("sequelize");
const { sequelize } = require("./connection");
const Logger = require("../Helpers/logger.helper");
const { withTransaction } = require("../Helpers/transaction.helper");

const PUBLIC_SCHEMA = "public";

const TARGETS = {
  publicMigrations: { folder: "Migrations/public", table: "_migrations" },
  tenantMigrations: { folder: "Migrations/tenant", table: "_migrations" },
  publicSeeders: { folder: "Seeders/public", table: "_seeders" },
  tenantSeeders: { folder: "Seeders/tenant", table: "_seeders" },
};

const queryInterface = sequelize.getQueryInterface();

/**
 * @description stores which migrations/seeders already ran, inside that schema itself
 * e.g. tenant_abc._migrations, tenant_abc._seeders, public._migrations
 */
class SchemaStorage {
  constructor(schema, table) {
    this.tableName = `${queryInterface.quoteIdentifier(schema)}.${queryInterface.quoteIdentifier(table)}`;
  }

  async ensureTable() {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (
        name VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    );
  }

  async executed() {
    await this.ensureTable();
    const [rows] = await sequelize.query(`SELECT name FROM ${this.tableName} ORDER BY name`);
    return rows.map((row) => row.name);
  }

  async markExecuted(name) {
    await sequelize.query(`INSERT INTO ${this.tableName} (name) VALUES (:name)`, {
      replacements: { name },
    });
  }

  async unmarkExecuted(name) {
    await sequelize.query(`DELETE FROM ${this.tableName} WHERE name = :name`, {
      replacements: { name },
    });
  }

  //? umzug calls these after up/down (outside transaction), we already did it inside -> no-op
  async logMigration() {}
  async unlogMigration() {}
}

/**
 * @description umzug instance for one schema + one target folder
 * every migration file gets { queryInterface, Sequelize, schema }
 * each file + its _migrations record run in ONE transaction -> fails = nothing half created
 */
function createUmzug(schema, target) {
  const { folder, table } = TARGETS[target];
  const folderPath = path.join(__dirname, folder);
  const context = { queryInterface, Sequelize, schema };
  const storage = new SchemaStorage(schema, table);

  //? one line log per file e.g. "[tenant_abc] tenantMigrations migrated 2026...-create-x.js"
  const log = (level) => (event) =>
    Logger[level](`[${schema}] ${target} ${event.event || ""} ${event.name || ""}`.trim());

  return new Umzug({
    context,
    storage,
    logger: { info: log("info"), warn: log("warn"), error: log("error"), debug: log("debug") },
    migrations: () =>
      fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"))
        .sort()
        .map((file) => {
          const migration = require(path.join(folderPath, file));
          return {
            name: file,
            up: () =>
              withTransaction(async () => {
                await migration.up(context);
                await storage.markExecuted(file);
              }),
            down: () =>
              withTransaction(async () => {
                await migration.down(context);
                await storage.unmarkExecuted(file);
              }),
          };
        }),
  });
}

/**
 * @description postgres lock per schema, so 2 PM2 instances never migrate same schema together
 * (second instance waits, then finds nothing pending)
 */
async function withSchemaLock(schema, task) {
  const connection = await sequelize.connectionManager.getConnection();

  try {
    await connection.query("SELECT pg_advisory_lock(hashtext($1))", [schema]);
    return await task();
  } finally {
    await connection.query("SELECT pg_advisory_unlock(hashtext($1))", [schema]);
    sequelize.connectionManager.releaseConnection(connection);
  }
}

/**
 * @description runs all pending migrations/seeders of target on schema
 */
async function runUp(schema, target) {
  return withSchemaLock(schema, () => createUmzug(schema, target).up());
}

/**
 * @description active client schemas from public.clients
 */
async function getTenantSchemas() {
  const [rows] = await sequelize.query(
    `SELECT schema_name FROM ${PUBLIC_SCHEMA}.clients WHERE is_active = true ORDER BY id`
  );
  return rows.map((row) => row.schema_name);
}

/**
 * @description public migrations first, then common migrations on every client schema.
 * each file runs only once per schema (tracked in _migrations)
 * called on server start / pm2 restart (RUN_MIGRATIONS_ON_START=true)
 * seeders never run here -> only manually with "npm run db:seed"
 */
async function runAllMigrations() {
  Logger.info("Running migrations...");

  await runUp(PUBLIC_SCHEMA, "publicMigrations");

  const schemas = await getTenantSchemas();
  for (const schema of schemas) await runUp(schema, "tenantMigrations");

  Logger.info(`Migrations done [public + ${schemas.length} client schemas]`);
}

module.exports = { PUBLIC_SCHEMA, runUp, getTenantSchemas, runAllMigrations };
