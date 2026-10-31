const { DataTypes } = require("sequelize");

/**
 * public.roles
 */
module.exports = (sequelize) => {
  const Role = sequelize.define(
    "Role",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      schema: "public",
      tableName: "roles",
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: "roleId", as: "users" });
  };

  return Role;
};
