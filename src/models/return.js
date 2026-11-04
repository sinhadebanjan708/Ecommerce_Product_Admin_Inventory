module.exports = (sequelize, DataTypes) => {
  const Return = sequelize.define('Return', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    order_item_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    reason: DataTypes.TEXT
  }, {
    tableName: 'Returns',
    timestamps: true,
    underscored: true
  });

  Return.associate = (models) => {
    Return.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    Return.belongsTo(models.OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });
    Return.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Return;
};