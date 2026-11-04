module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define(
    "Warehouse",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      warehouse_name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      pincode: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: true
      },

      state: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "India"
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
      tableName: "Warehouses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true
    }
  );
 Warehouse.associate = (models) => {
    Warehouse.hasMany(models.Inventory, { foreignKey: 'warehouse_id', as: 'inventory' });
  };
  return Warehouse;
};