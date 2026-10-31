/**
 * PUBLIC migration -> global roles (same for every client)
 */
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.createTable(
      { tableName: "roles", schema },
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
        description: { type: Sequelize.STRING(255), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      }
    );
  },

  async down({ queryInterface, schema }) {
    await queryInterface.dropTable({ tableName: "roles", schema });
  },
};
