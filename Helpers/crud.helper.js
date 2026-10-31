const { Op } = require("sequelize");
const { generateCustomError } = require("./error.helper");
const { withTransaction } = require("./transaction.helper");

/**
 * NOTE: "model" can be a public model (Client, User) or a tenant model
 * from getTenantModel("Product") -> already pointing to current client schema.
 * inside withTransaction() every function here joins that transaction automatically.
 */

/**
 * @description throws 409 if any row matches the query
 * @example await isUnique(User, { email })
 */
async function isUnique(model, query) {
  const exists = await model.findOne({ where: query, attributes: ["id"] });

  if (exists) generateCustomError("Data already exists", "conflict_error", 409, "duplicate");

  return true;
}

/**
 * @description count of rows matching query
 */
async function getCount(model, query = {}) {
  return model.count({ where: query });
}

/**
 * @description creates one row
 * @param options object: e.g. { transaction }
 */
async function create(model, data, options = {}) {
  return model.create(data, options);
}

/**
 * @description creates multiple rows
 * @param data array of objects
 */
async function createMany(model, data, options = {}) {
  return model.bulkCreate(data, options);
}

/**
 * @description finds first row matching query
 * @param select array of column names, empty = all (default scope)
 * @param orderBy e.g. [["createdAt", "DESC"]]
 * @param include sequelize include array e.g. [{ model: Role, as: "role" }]
 */
async function read(model, query, select = [], orderBy = [], include = []) {
  return model.findOne({
    where: query,
    attributes: select.length ? select : undefined,
    order: orderBy.length ? orderBy : undefined,
    include: include.length ? include : undefined,
  });
}

/**
 * @description updates all rows matching query
 * @returns number of updated rows
 */
async function updateMany(model, query, data, options = {}) {
  const [updatedCount] = await model.update(data, { where: query, ...options });
  return updatedCount;
}

/**
 * @description updates single row matching query, throws 404 if not found
 * @returns updated row
 */
async function updateOne(model, query, data, options = {}) {
  return withTransaction(async () => {
    const row = await model.findOne({ where: query, ...options });

    if (!row) generateCustomError("Data not found", "not_found", 404, "notFound");

    return row.update(data, options);
  });
}

/**
 * @description deletes all rows matching query
 * @returns number of deleted rows
 */
async function remove(model, query, options = {}) {
  return model.destroy({ where: query, ...options });
}

/**
 * @description finds many rows with filters, relations and pagination
 * @param query object | array of objects (array is joined with logical)
 * @param logical "AND" | "OR" (only used when query is an array)
 * @param projection array of column names
 * @param include sequelize include array e.g. [{ model: getTenantModel("Post"), as: "posts" }]
 * @param orderBy e.g. [["createdAt", "DESC"]]
 * @param pagination { skip, limit }
 * @returns { rows, count } -> rows are plain objects when possible (fast, read only)
 */
async function findManyDetails(
  model,
  query,
  logical = "AND",
  projection = [],
  include = [],
  orderBy = [],
  pagination = {}
) {
  let whereClause = {};

  if (Array.isArray(query)) {
    if (logical === "OR") whereClause = { [Op.or]: query };
    else if (logical === "AND") whereClause = { [Op.and]: query };
    else throw new Error("Invalid logical operator. Use 'AND' or 'OR'.");
  } else if (query && typeof query === "object") {
    whereClause = query;
  }

  return model.findAndCountAll({
    where: whereClause,
    attributes: projection.length ? projection : undefined,
    include: include.length ? include : undefined,
    order: orderBy.length ? orderBy : undefined,
    offset: pagination.skip || undefined,
    limit: pagination.limit || undefined,
    distinct: include.length > 0,
    //? raw rows are ~60% faster (read only, fine for lists), but raw can't group hasMany
    //? children into arrays -> only when every include is single (belongsTo / hasOne)
    ...(include.every((item) => model.associations[item.as]?.isMultiAssociation === false) && {
      raw: true,
      nest: true,
    }),
  });
}

module.exports = {
  isUnique,
  getCount,
  read,
  create,
  createMany,
  updateMany,
  updateOne,
  remove,
  findManyDetails,
};
