/**
 * PUBLIC migration -> master list of all menus (managed by super admin)
 * parent_id NULL = top level / group, else child of that menu (grouping + nesting)
 * key = unique code used by frontend (e.g. "users.list")
 */
module.exports = {
  async up({ queryInterface, Sequelize, schema }) {
    await queryInterface.createTable(
      { tableName: "menus", schema },
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        parent_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: { tableName: "menus", schema }, key: "id" },
          onDelete: "CASCADE",
        },
        key: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        title: { type: Sequelize.STRING(100), allowNull: false },
        icon: { type: Sequelize.STRING(100), allowNull: true },
        path: { type: Sequelize.STRING(255), allowNull: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      }
    );

    await queryInterface.addIndex({ tableName: "menus", schema }, ["parent_id"]);
  },

  async down({ queryInterface, schema }) {
    await queryInterface.dropTable({ tableName: "menus", schema });
  },
};
