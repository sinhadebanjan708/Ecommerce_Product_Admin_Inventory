module.exports = (sequelize, DataTypes) => {
  const CouponUsage = sequelize.define('CouponUsage', {   // ← Changed to PascalCase
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    coupon_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'Coupon_Usages',
    timestamps: true,
    underscored: true
  });

  CouponUsage.associate = (models) => {
    CouponUsage.belongsTo(models.Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
    CouponUsage.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    CouponUsage.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  };

  return CouponUsage;
};