module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    permission_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'Permissions',
    timestamps: true,
    underscored: true
  });

  Permission.associate = (models) => {
    Permission.hasMany(models.RolePermission, { foreignKey: 'permission_id', as: 'rolePermissions' });
  };

  return Permission;
};