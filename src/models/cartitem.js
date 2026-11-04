module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    cart_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    variant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Cart_Items',
    timestamps: true,
    underscored: true
  });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
    CartItem.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
  };

  return CartItem;
};