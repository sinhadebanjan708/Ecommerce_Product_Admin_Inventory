module.exports = (sequelize, DataTypes) => {
  const LowStockAlert = sequelize.define(
    "LowStockAlert",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      inventory_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      available_stock: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      reorder_level: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "open",
        validate: {
          isIn: [["open", "acknowledged", "resolved"]]
        }
      },

      acknowledged_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },

      acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true
      },

      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "Low_Stock_Alerts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
      indexes: [
        {
          fields: ["status"]
        },
        {
          fields: ["inventory_id"]
        }
      ]
    }
  );
   LowStockAlert.associate = (models) => {
    LowStockAlert.belongsTo(models.Inventory, {
  foreignKey: "inventory_id",
  as: "inventory"
});
  };
  return LowStockAlert;
};