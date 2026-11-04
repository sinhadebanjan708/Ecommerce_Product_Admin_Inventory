module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    phone: DataTypes.STRING(20),
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'active'
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'Users',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });
    User.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
    User.hasMany(models.UserRole, { foreignKey: 'user_id', as: 'userRoles' });
    User.hasMany(models.Product, { foreignKey: 'created_by', as: 'createdProducts' });
    User.hasMany(models.ProductReview, { foreignKey: 'user_id', as: 'reviews' });
    User.hasMany(models.Cart, { foreignKey: 'user_id', as: 'carts' });
    User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
    User.hasMany(models.CouponUsage, { foreignKey: 'user_id', as: 'couponUsages' });
    User.hasMany(models.Return, { foreignKey: 'user_id', as: 'returns' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
  };

  return User;
};