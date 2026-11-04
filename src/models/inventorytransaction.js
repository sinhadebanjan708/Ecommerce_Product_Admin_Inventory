module.exports = (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    inventory_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    created_by: DataTypes.BIGINT.UNSIGNED,
    transaction_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference_id: DataTypes.STRING(100)
  }, {
    tableName: 'Inventory_Transactions',
    timestamps: true,
    underscored: true
  });

  InventoryTransaction.associate = (models) => {
    InventoryTransaction.belongsTo(models.Inventory, { foreignKey: 'inventory_id', as: 'inventory' });
    InventoryTransaction.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  };

  return InventoryTransaction;
};