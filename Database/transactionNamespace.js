const { AsyncLocalStorage } = require("node:async_hooks");

const storage = new AsyncLocalStorage();

/**
 * @description small CLS namespace (on node's AsyncLocalStorage) given to Sequelize.useCLS()
 * sequelize keeps the running transaction here, so every query inside
 * withTransaction() picks it automatically -> no need to pass { transaction } everywhere
 */
const transactionNamespace = {
  get: (key) => storage.getStore()?.get(key),

  set: (key, value) => storage.getStore()?.set(key, value),

  run(callback) {
    const context = new Map(storage.getStore()); // child copy, parent context stays untouched
    storage.run(context, () => callback(context));
    return context;
  },

  bind: (callback) => callback,
};

module.exports = { transactionNamespace };
