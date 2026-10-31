const { DataTypes } = require("sequelize");

/**
 * public.client_menus -> menus given to a client, all users of that client see them
 */
module.exports = (sequelize) => {
  const ClientMenu = sequelize.define(
    "ClientMenu",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      clientId: { type: DataTypes.INTEGER, allowNull: false },
      menuId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      schema: "public",
      tableName: "client_menus",
    }
  );

  ClientMenu.associate = (models) => {
    ClientMenu.belongsTo(models.Client, { foreignKey: "clientId", as: "client" });
    ClientMenu.belongsTo(models.Menu, { foreignKey: "menuId", as: "menu" });
  };

  return ClientMenu;
};
