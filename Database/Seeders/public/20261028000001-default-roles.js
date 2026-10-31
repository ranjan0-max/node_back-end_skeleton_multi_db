const { ROLES } = require("../../../Helpers/constants.helper");

/**
 * PUBLIC seeder -> default global roles
 */
module.exports = {
  async up({ queryInterface, schema }) {
    const now = new Date();

    await queryInterface.bulkInsert({ tableName: "roles", schema }, [
      { name: ROLES.SUPER_ADMIN, description: "Platform owner", created_at: now, updated_at: now },
      { name: ROLES.ADMIN, description: "Client admin", created_at: now, updated_at: now },
    ]);
  },

  async down({ queryInterface, Sequelize, schema }) {
    await queryInterface.bulkDelete(
      { tableName: "roles", schema },
      { name: { [Sequelize.Op.in]: Object.values(ROLES) } }
    );
  },
};
