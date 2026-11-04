module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    "Inventory",
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

      quantity_available: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      quantity_reserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      reorder_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      updated_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      }
    },
    {
      tableName: "Inventory",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["warehouse_id", "variant_id"],
          name: "uk_wh_variant"
        }
      ]
    }
  );
  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Inventory.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
    Inventory.hasMany(models.InventoryTransaction, { foreignKey: 'inventory_id', as: 'transactions' });
    Inventory.hasMany(models.StockMovement, {
  foreignKey: "warehouse_id",
  sourceKey: "warehouse_id",
  as: "warehouseMovements"
});


Inventory.hasMany(models.LowStockAlert, {
  foreignKey: "inventory_id",
  as: "lowStockAlerts"
});
Inventory.hasMany(models.InventoryReservation, {
  foreignKey: "inventory_id",
  as: "reservations"
});
  }
  return Inventory;
};