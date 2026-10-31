const { DataTypes } = require("sequelize");

/**
 * public.users -> users of every client (clientId NULL = super admin)
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      clientId: { type: DataTypes.INTEGER, allowNull: true },
      roleId: { type: DataTypes.INTEGER, allowNull: true },
      name: { type: DataTypes.STRING(100), allowNull: true },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sessionId: { type: DataTypes.STRING(64), allowNull: true }, // current login (one device)
    },
    {
      schema: "public",
      tableName: "users",
      //? password + sessionId never selected by default (never sent in responses)
      defaultScope: { attributes: { exclude: ["password", "sessionId"] } },
      scopes: { withPassword: { attributes: { include: ["password"] } } },
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Client, { foreignKey: "clientId", as: "client" });
    User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
  };

  return User;
};
