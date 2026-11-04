module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    discount_type: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    tableName: 'Coupons',
    timestamps: true,
    underscored: true
  });

 Coupon.associate = (models) => {
  Coupon.hasMany(models.CouponUsage, {     // ← PascalCase
    foreignKey: 'coupon_id',
    as: 'usages'
  });
};

  return Coupon;
};