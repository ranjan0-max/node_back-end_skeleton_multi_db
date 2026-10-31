const { sequelize } = require("../Database/connection");
const { transactionNamespace } = require("../Database/transactionNamespace");

/**
 * @description runs callback inside a DB transaction
 * all ok -> commit, any error thrown -> rollback (no junk / half saved data)
 * every query inside (crud helper, models, raw queries) joins it automatically
 * already inside a transaction -> joins that one, so nested service calls stay in one transaction
 * @example
 * return withTransaction(async () => {
 *   const order = await create(Order, data);
 *   await createMany(OrderItem, items);   // fails -> order is also rolled back
 *   return order;
 * });
 */
async function withTransaction(callback) {
  const current = transactionNamespace.get("transaction");

  if (current) return callback(current);

  return sequelize.transaction(callback);
}

module.exports = { withTransaction };
