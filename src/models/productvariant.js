module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
seller_type: {
  type: DataTypes.ENUM("Inventory", "POD"),
  allowNull: false,
  validate: {
    isIn: [["Inventory", "POD"]]
  }
},

      size: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      color: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      fit: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },

      sale_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
      },
        delivery_date: {
        type: DataTypes.DATE,
        allowNull: true
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "active",
        validate: {
          isIn: [["active", "inactive"]]
        }
      }
    },
    {
      tableName: "Product_Variants",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true
    }
  );
    ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    ProductVariant.hasMany(models.Inventory, { foreignKey: 'variant_id', as: 'inventory' });
    ProductVariant.hasMany(models.CartItem, { foreignKey: 'variant_id', as: 'cartItems' });
    ProductVariant.hasMany(models.OrderItem, { foreignKey: 'variant_id', as: 'orderItems' });
    ProductVariant.hasMany(models.StockMovement, {
  foreignKey: "variant_id",
  as: "stockMovements"
});
  };
  return ProductVariant;
};