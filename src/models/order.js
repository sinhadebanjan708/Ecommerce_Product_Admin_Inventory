module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    address_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    payment_status: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    expected_delivery_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'Orders',
    timestamps: true,
    underscored: true
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Order.belongsTo(models.Address, { foreignKey: 'address_id', as: 'address' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
    Order.hasMany(models.Payment, { foreignKey: 'order_id', as: 'payments' });
    Order.hasMany(models.Refund, { foreignKey: 'order_id', as: 'refunds' });
    Order.hasMany(models.CouponUsage, { foreignKey: 'order_id', as: 'couponUsages' });
    Order.hasMany(models.Return, { foreignKey: 'order_id', as: 'returns' });
  };

  return Order;
};