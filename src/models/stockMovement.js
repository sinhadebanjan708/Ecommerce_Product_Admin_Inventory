module.exports = (sequelize, DataTypes) => {
  const StockMovement = sequelize.define(
    "StockMovement",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      warehouse_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      variant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      movement_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [[
            "INITIAL_STOCK",
            "STOCK_IN",
            "STOCK_OUT",
            "ADJUSTMENT",
            "RESERVE",
            "RELEASE",
            "SALE",
            "RETURN",
            "DAMAGE",
            "TRANSFER_IN",
            "TRANSFER_OUT"
          ]]
        }
      },

      quantity_change: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      quantity_on_hand_after: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      quantity_reserved_after: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      reference_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },

      reason: {
        type: DataTypes.STRING(255),
        allowNull: true
      },

      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      }
    },
    {
      tableName: "Stock_Movements",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          fields: ["variant_id", "created_at"]
        },
        {
          fields: ["warehouse_id", "created_at"]
        }
      ]
    }
  );
   StockMovement.associate = (models) => {
    StockMovement.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
    StockMovement.belongsTo(models.Warehouse, {
  foreignKey: "warehouse_id",
  as: "warehouse"
});
  };
  return StockMovement;
};