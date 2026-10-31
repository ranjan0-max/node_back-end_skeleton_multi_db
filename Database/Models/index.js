const fs = require("node:fs");
const path = require("node:path");
const { sequelize } = require("../connection");
const { tenantStorage } = require("../../Helpers/tenantContext.helper");
const { generateCustomError } = require("../../Helpers/error.helper");

const models = {};

/**
 * @description loads every *.model.js file of a folder into models object
 */
function loadModels(folder) {
  const folderPath = path.join(__dirname, folder);

  fs.readdirSync(folderPath)
    .filter((file) => file.endsWith(".model.js"))
    .forEach((file) => {
      const model = require(path.join(folderPath, file))(sequelize);
      models[model.name] = model;
    });
}

loadModels("public");
loadModels("tenant");

//? relations (hasMany, belongsTo...) after all models are loaded
Object.values(models).forEach((model) => model.associate?.(models));

/**
 * @description tenant model pointing to current request's schema
 * @example const Product = getTenantModel("Product"); await Product.findAll();
 * @param name model name
 * @param schema optional, defaults to current request's client schema (set by auth middleware)
 */
function getTenantModel(name, schema = tenantStorage.getStore()?.tenant?.schemaName) {
  const model = models[name];

  if (!model) throw new Error(`Model "${name}" not found`);
  if (!schema) generateCustomError("tenant not resolved", "tenant_error", 400, "tenantMissing");

  return model.schema(schema);
}

module.exports = { ...models, models, getTenantModel };
