/**
 * PUBLIC migration -> all users of all clients
 * client_id NULL = platform super admin
 * relations: users.client_id -> clients.id, users.role_id -> roles.id
 */
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.createTable(
      { tableName: "users", schema },
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        client_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: { tableName: "clients", schema }, key: "id" },
          onDelete: "CASCADE",
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: { tableName: "roles", schema }, key: "id" },
          onDelete: "SET NULL",
        },
        name: { type: Sequelize.STRING(100), allowNull: true },
        email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      }
    );

    await queryInterface.addIndex({ tableName: "users", schema }, ["client_id"]);
  },

  async down({ queryInterface, schema }) {
    await queryInterface.dropTable({ tableName: "users", schema });
  },
};
