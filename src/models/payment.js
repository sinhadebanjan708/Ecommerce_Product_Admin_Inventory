module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    payment_reference: DataTypes.STRING(150),
    gateway: DataTypes.STRING(50),
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false
    }
  }, {
    tableName: 'Payments',
    timestamps: true,
    underscored: true
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    Payment.hasMany(models.Refund, { foreignKey: 'payment_id', as: 'refunds' });
  };

  return Payment;
};