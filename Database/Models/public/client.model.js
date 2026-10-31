const { DataTypes } = require("sequelize");

/**
 * public.clients -> one row per client, schemaName = that client's postgres schema
 */
module.exports = (sequelize) => {
  const Client = sequelize.define(
    "Client",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: true },
      slug: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      schemaName: { type: DataTypes.STRING(63), allowNull: false, unique: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      schema: "public",
      tableName: "clients",
    }
  );

  Client.associate = (models) => {
    Client.hasMany(models.User, { foreignKey: "clientId", as: "users" });
  };

  return Client;
};
