module.exports = (sequelize, DataTypes) => {
  const InventoryReservation = sequelize.define(
    "InventoryReservation",
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

      order_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      order_item_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "reserved",
        validate: {
          isIn: [["reserved", "released", "consumed", "expired"]]
        }
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "Inventory_Reservations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["inventory_id", "order_item_id"],
          name: "uk_order_item_inventory"
        },
        {
          fields: ["order_id"]
        },
        {
          fields: ["status", "expires_at"]
        }
      ]
    }
  );

    InventoryReservation.associate = (models) => {
        InventoryReservation.belongsTo(models.Inventory, {
        foreignKey: "inventory_id",
        as: "inventory"
        });
    }

  return InventoryReservation;
};