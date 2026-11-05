const { Op } = require("sequelize");

const {
  sequelize,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  Inventory,
  Order,
  OrderItem,
  InventoryReservation
} = require("../models");

class CheckoutService {

  async createOrder(userId, data) {
    const transaction = await sequelize.transaction();

    try {
      const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [
          {
            model: CartItem,
            as: "items",
            include: [
              {
                model: ProductVariant,
                as: "variant",
                include: [
                  {
                    model: Product,
                    as: "product"
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      if (!cart || !cart.items?.length) {
        throw new Error("Your cart is empty");
      }

      let totalAmount = 0;
      const orderLines = [];

      // Validate products and calculate price from DB
      for (const item of cart.items) {
        const variant = item.variant;
        const product = variant?.product;

        if (
          !variant ||
          !product ||
          product.status !== "published" ||
          variant.status !== "active"
        ) {
          throw new Error("One or more cart products are unavailable");
        }

        if (variant.seller_type === "POD") {
          throw new Error(
            "POD items require the separate POD fulfilment checkout flow"
          );
        }

        const quantity = Number(item.quantity);
        const unitPrice = Number(
          variant.sale_price ?? variant.price
        );

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error("Invalid cart quantity");
        }

        const lineTotal = unitPrice * quantity;
        totalAmount += lineTotal;

        orderLines.push({
          variant,
          quantity,
          unitPrice,
          lineTotal,
          productName: product.product_name
        });
      }

      // Create order first, inside the same transaction
      const order = await Order.create(
        {
          user_id: userId,
          status: "PENDING_PAYMENT",
          total_amount: totalAmount,
          shipping_address_id: data.shipping_address_id,
          payment_method: data.payment_method
        },
        { transaction }
      );

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      for (const line of orderLines) {
        // Lock all warehouse inventory rows for this SKU.
        const inventoryRows = await Inventory.findAll({
          where: {
            variant_id: line.variant.id
          },
          order: [["warehouse_id", "ASC"]],
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        let remaining = line.quantity;

        const totalAvailable = inventoryRows.reduce(
          (sum, inventory) =>
            sum +
            Number(inventory.quantity_available) -
            Number(inventory.quantity_reserved),
          0
        );

        if (totalAvailable < line.quantity) {
          throw new Error(
            `Insufficient stock for SKU ${line.variant.sku}`
          );
        }

        // Store price and product information as order snapshots.
        const orderItem = await OrderItem.create(
          {
            order_id: order.id,
            variant_id: line.variant.id,
            product_name: line.productName,
            sku: line.variant.sku,
            unit_price: line.unitPrice,
            quantity: line.quantity,
            total_price: line.lineTotal
          },
          { transaction }
        );

        // Reserve stock across warehouses if necessary.
        for (const inventory of inventoryRows) {
          if (remaining <= 0) break;

          const available =
            Number(inventory.quantity_available) -
            Number(inventory.quantity_reserved);

          if (available <= 0) continue;

          const reserveQty = Math.min(available, remaining);

          await inventory.increment(
            "quantity_reserved",
            {
              by: reserveQty,
              transaction
            }
          );

          await InventoryReservation.create(
            {
              order_id: order.id,
              order_item_id: orderItem.id,
              inventory_id: inventory.id,
              variant_id: line.variant.id,
              quantity: reserveQty,
              status: "ACTIVE",
              expires_at: expiresAt
            },
            { transaction }
          );

          remaining -= reserveQty;
        }

        if (remaining > 0) {
          throw new Error(
            `Unable to reserve complete quantity for ${line.variant.sku}`
          );
        }
      }

      await transaction.commit();

      return {
        message: "Order created and stock reserved",
        order_id: order.id,
        status: "PENDING_PAYMENT",
        total_amount: totalAmount,
        reservation_expires_at: expiresAt
      };

    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  }
}

module.exports = new CheckoutService();