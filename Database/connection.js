const { Sequelize } = require("sequelize");
const Logger = require("../Helpers/logger.helper");
const { transactionNamespace } = require("./transactionNamespace");

//? queries inside withTransaction() automatically join that transaction
Sequelize.useCLS(transactionNamespace);

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL, DB_POOL_MAX, DB_LOGGING } =
  process.env;

/**
 * @description single sequelize instance (one connection pool) for public + all tenant schemas
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT) || 5432,
  dialect: "postgres",
  //? DB_LOGGING=true -> every SQL query in console + logs/app.<date>.log
  logging: DB_LOGGING === "true" ? (sql) => Logger.info({ type: "sql" }, sql) : false,
  dialectOptions: DB_SSL === "true" ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  pool: {
    max: Number(DB_POOL_MAX) || 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true, // createdAt -> created_at in DB
    timestamps: true,
  },
});

module.exports = { sequelize };
