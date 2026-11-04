module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    role_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT
  }, {
    tableName: 'Roles',
    timestamps: true,
    underscored: true
  });

  Role.associate = (models) => {
    Role.hasMany(models.UserRole, { foreignKey: 'role_id', as: 'userRoles' });
    Role.hasMany(models.RolePermission, { foreignKey: 'role_id', as: 'rolePermissions' });
  };

  return Role;
};