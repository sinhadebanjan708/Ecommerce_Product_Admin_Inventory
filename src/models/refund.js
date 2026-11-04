module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define('Refund', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    payment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    refund_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false
    }
  }, {
    tableName: 'Refunds',
    timestamps: true,
    underscored: true
  });

  Refund.associate = (models) => {
    Refund.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
    Refund.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  };

  return Refund;
};