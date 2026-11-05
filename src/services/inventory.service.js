const {
  sequelize,
  Inventory,
  StockMovement
} = require("../models");

class InventoryService {

  async adjustStock(data, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const inventory = await Inventory.findByPk(
        data.inventory_id,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

      if (!inventory) {
        throw new Error("Inventory record not found");
      }

      const oldQuantity = Number(inventory.quantity_available);
      const newQuantity = Number(data.quantity_available);

      if (!Number.isInteger(newQuantity) || newQuantity < 0) {
        throw new Error("Invalid stock quantity");
      }

      if (
        newQuantity <
        Number(inventory.quantity_reserved)
      ) {
        throw new Error(
          "Stock cannot be less than already reserved quantity"
        );
      }

      const quantityChange = newQuantity - oldQuantity;

      await inventory.update(
        {
          quantity_available: newQuantity,
          updated_by: adminId
        },
        { transaction }
      );

      if (quantityChange !== 0) {
        await StockMovement.create(
          {
            variant_id: inventory.variant_id,
            warehouse_id: inventory.warehouse_id,
            movement_type: "ADJUSTMENT",
            quantity: quantityChange,
            reason: data.reason,
            created_by: adminId
          },
          { transaction }
        );
      }

      const sellableStock =
        newQuantity - Number(inventory.quantity_reserved);

      const isLowStock =
        sellableStock <= Number(inventory.reorder_level);

      await transaction.commit();

      return {
        message: "Stock adjusted successfully",
        quantity_available: newQuantity,
        quantity_reserved: Number(inventory.quantity_reserved),
        sellable_stock: sellableStock,
        low_stock: isLowStock
      };

    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  }
}

module.exports = new InventoryService();