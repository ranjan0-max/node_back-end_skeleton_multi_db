const { AsyncLocalStorage } = require("node:async_hooks");

/**
 * @description keeps current request's client (schema) in memory for that request only
 * - app.js (onRequest): every request gets its own empty store { tenant: null }
 * - auth middleware: store.tenant = { id, slug, schemaName } after login check
 * - getTenantModel("X"): reads store.tenant.schemaName -> no need to pass schema everywhere
 */
const tenantStorage = new AsyncLocalStorage();

module.exports = { tenantStorage };
