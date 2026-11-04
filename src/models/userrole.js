module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    assigned_by: DataTypes.BIGINT.UNSIGNED
  }, {
    tableName: 'User_Roles',
    timestamps: true,
    underscored: true
  });

  UserRole.associate = (models) => {
    UserRole.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    UserRole.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    UserRole.belongsTo(models.User, { foreignKey: 'assigned_by', as: 'assignedBy' });
  };

  return UserRole;
};