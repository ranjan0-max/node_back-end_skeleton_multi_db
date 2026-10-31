/**
 * PUBLIC migration -> current login session of user (one device at a time)
 * new login replaces it, logout clears it, token with old session_id is rejected
 */
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.addColumn({ tableName: "users", schema }, "session_id", {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
  },

  async down({ queryInterface, schema }) {
    await queryInterface.removeColumn({ tableName: "users", schema }, "session_id");
  },
};
