const { ROLES } = require("../../../Helpers/constants.helper");
const { generateHash } = require("../../../Helpers/auth.helper");

/**
 * PUBLIC seeder -> first super admin from .env (SUPER_ADMIN_NAME / EMAIL / PASSWORD)
 */
module.exports = {
  async up({ queryInterface, schema }) {
    const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;

    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD)
      throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required in .env");

    const roleId = await queryInterface.rawSelect(
      { tableName: "roles", schema },
      { where: { name: ROLES.SUPER_ADMIN } },
      "id"
    );
    const now = new Date();

    await queryInterface.bulkInsert({ tableName: "users", schema }, [
      {
        client_id: null,
        role_id: roleId,
        name: SUPER_ADMIN_NAME || "Super Admin",
        email: SUPER_ADMIN_EMAIL,
        password: await generateHash(SUPER_ADMIN_PASSWORD),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down({ queryInterface, schema }) {
    await queryInterface.bulkDelete(
      { tableName: "users", schema },
      { email: process.env.SUPER_ADMIN_EMAIL }
    );
  },
};
