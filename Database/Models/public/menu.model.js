const { DataTypes } = require("sequelize");

/**
 * public.menus -> master menu list, parentId NULL = top level / group
 */
module.exports = (sequelize) => {
  const Menu = sequelize.define(
    "Menu",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      parentId: { type: DataTypes.INTEGER, allowNull: true },
      key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(100), allowNull: false },
      icon: { type: DataTypes.STRING(100), allowNull: true },
      path: { type: DataTypes.STRING(255), allowNull: true },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      schema: "public",
      tableName: "menus",
    }
  );

  Menu.associate = (models) => {
    Menu.belongsTo(models.Menu, { foreignKey: "parentId", as: "parent" });
    Menu.hasMany(models.Menu, { foreignKey: "parentId", as: "children" });
    Menu.hasMany(models.ClientMenu, { foreignKey: "menuId", as: "clientMenus" });
  };

  return Menu;
};
