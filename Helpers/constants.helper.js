/**
 * @description role names, must match rows seeded in public.roles
 */
const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin", // platform owner, no client
  ADMIN: "admin", // client admin
  USER: "user", // client user
});

module.exports = { ROLES };
