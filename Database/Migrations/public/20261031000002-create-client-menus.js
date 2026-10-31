/**
 * PUBLIC migration -> menus given to a client by super admin
 * every user of that client sees these menus
 * relations: client_menus.client_id -> clients.id, client_menus.menu_id -> menus.id
 */
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.createTable(
      { tableName: "client_menus", schema },
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        client_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: { tableName: "clients", schema }, key: "id" },
          onDelete: "CASCADE",
        },
        menu_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: { tableName: "menus", schema }, key: "id" },
          onDelete: "CASCADE",
        },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      }
    );

    await queryInterface.addIndex({ tableName: "client_menus", schema }, ["client_id", "menu_id"], {
      unique: true,
    });
  },

  async down({ queryInterface, schema }) {
    await queryInterface.dropTable({ tableName: "client_menus", schema });
  },
};
