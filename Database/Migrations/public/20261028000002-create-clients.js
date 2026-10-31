/**
 * PUBLIC migration -> one row per client, schema_name = that client's own postgres schema
 */
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.createTable(
      { tableName: "clients", schema },
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(150), allowNull: true },
        slug: { type: Sequelize.STRING(50), allowNull: false, unique: true },
        schema_name: { type: Sequelize.STRING(63), allowNull: false, unique: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      }
    );
  },

  async down({ queryInterface, schema }) {
    await queryInterface.dropTable({ tableName: "clients", schema });
  },
};
