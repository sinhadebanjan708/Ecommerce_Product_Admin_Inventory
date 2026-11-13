const { Op } = require("sequelize");
const crypto = require("crypto");
const {
  sequelize,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  ProductVariantImage,
  Address,
  Inventory,
  Order,
  OrderItem,
  InventoryReservation
} = require("../models");

class CheckoutService {

  // async createOrder(userId, data) {
  //   const transaction = await sequelize.transaction();

  //   try {
  //     const cart = await Cart.findOne({
  //       where: { user_id: userId },
  //       include: [
  //         {
  //           model: CartItem,
  //           as: "items",
  //           include: [
  //             {
  //               model: ProductVariant,
  //               as: "variant",
  //               include: [
  //                 {
  //                   model: Product,
  //                   as: "product"
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ],
  //       transaction
  //     });

  //     if (!cart || !cart.items?.length) {
  //       throw new Error("Your cart is empty");
  //     }

  //     let totalAmount = 0;
  //     const orderLines = [];

  //     // Validate products and calculate price from DB
  //     for (const item of cart.items) {
  //       const variant = item.variant;
  //       const product = variant?.product;

  //       if (
  //         !variant ||
  //         !product ||
  //         product.status !== "published" ||
  //         variant.status !== "active"
  //       ) {
  //         throw new Error("One or more cart products are unavailable");
  //       }
  //       // Need to integrate QuickInk

  //       // if (variant.seller_type === "POD") {
  //       //   throw new Error(
  //       //     "POD items require the separate POD fulfilment checkout flow"
  //       //   );
  //       // }

  //       const quantity = Number(item.quantity);
  //       const unitPrice = Number(
  //         variant.sale_price ?? variant.price
  //       );

  //       if (!Number.isInteger(quantity) || quantity < 1) {
  //         throw new Error("Invalid cart quantity");
  //       }

  //       const lineTotal = unitPrice * quantity;
  //       totalAmount += lineTotal;

  //       orderLines.push({
  //         variant,
  //         quantity,
  //         unitPrice,
  //         lineTotal,
  //         productName: product.product_name
  //       });
  //     }

  //     // Create order first, inside the same transaction
  //     const order = await Order.create(
  //       {
  //         user_id: userId,
  //         payment_status: "Paid",
  //         total_amount: totalAmount,
  //         address_id: data.shipping_address_id,
  //         order_number:formField,
  //         payment_method: data.payment_method
  //       },
  //       { transaction }
  //     );

  //     const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  //     // for (const line of orderLines) {
  //     //   // Lock all warehouse inventory rows for this SKU.
  //     //   const inventoryRows = await Inventory.findAll({
  //     //     where: {
  //     //       variant_id: line.variant.id
  //     //     },
  //     //     order: [["warehouse_id", "ASC"]],
  //     //     transaction,
  //     //     lock: transaction.LOCK.UPDATE
  //     //   });

  //     //   let remaining = line.quantity;

  //     //   const totalAvailable = inventoryRows.reduce(
  //     //     (sum, inventory) =>
  //     //       sum +
  //     //       Number(inventory.quantity_available) -
  //     //       Number(inventory.quantity_reserved),
  //     //     0
  //     //   );

  //     //   if (totalAvailable < line.quantity) {
  //     //     throw new Error(
  //     //       `Insufficient stock for SKU ${line.variant.sku}`
  //     //     );
  //     //   }

  //     //   // Store price and product information as order snapshots.
  //     //   const orderItem = await OrderItem.create(
  //     //     {
  //     //       order_id: order.id,
  //     //       variant_id: line.variant.id,
  //     //       product_name: line.productName,
  //     //       sku: line.variant.sku,
  //     //       unit_price: line.unitPrice,
  //     //       quantity: line.quantity,
  //     //       total_price: line.lineTotal
  //     //     },
  //     //     { transaction }
  //     //   );

  //     //   // Reserve stock across warehouses if necessary.
  //     //   for (const inventory of inventoryRows) {
  //     //     if (remaining <= 0) break;

  //     //     const available =
  //     //       Number(inventory.quantity_available) -
  //     //       Number(inventory.quantity_reserved);

  //     //     if (available <= 0) continue;

  //     //     const reserveQty = Math.min(available, remaining);

  //     //     await inventory.increment(
  //     //       "quantity_reserved",
  //     //       {
  //     //         by: reserveQty,
  //     //         transaction
  //     //       }
  //     //     );

  //     //     await InventoryReservation.create(
  //     //       {
  //     //         order_id: order.id,
  //     //         order_item_id: orderItem.id,
  //     //         inventory_id: inventory.id,
  //     //         variant_id: line.variant.id,
  //     //         quantity: reserveQty,
  //     //         status: "ACTIVE",
  //     //         expires_at: expiresAt
  //     //       },
  //     //       { transaction }
  //     //     );

  //     //     remaining -= reserveQty;
  //     //   }

  //     //   if (remaining > 0) {
  //     //     throw new Error(
  //     //       `Unable to reserve complete quantity for ${line.variant.sku}`
  //     //     );
  //     //   }
  //     // }

  //     await transaction.commit();

  //     return {
  //       message: "Order created and stock reserved",
  //       order_id: order.id,
  //       status: "PENDING_PAYMENT",
  //       total_amount: totalAmount,
  //       reservation_expires_at: expiresAt
  //     };

  //   } catch (error) {
  //     if (!transaction.finished) {
  //       await transaction.rollback();
  //     }

  //     throw error;
  //   }
  // }

  calculateExpectedDeliveryDate = (deliveryDays) => {
  const days = Number(deliveryDays);

  if (!Number.isInteger(days) || days < 0) {
    throw new Error("Invalid delivery days configured for product variant");
  }

  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
};

formatDate = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date provided: ${date}`);
  }

  return parsedDate.toISOString();
};

async createOrder(userId, data) {
 const transaction = await sequelize.transaction();

  try {
    const { items, payment_method } = data;

    // 1. Validate selected cart items
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Please select at least one cart item");
    }

    const normalizedItems = items.map((item) => ({
      cart_item_id: Number(item.cart_item_id),
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedItems) {
      if (
        !Number.isInteger(item.cart_item_id) ||
        item.cart_item_id <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error("Invalid cart item ID or quantity");
      }
    }

    const selectedIds = normalizedItems.map(
      (item) => item.cart_item_id
    );

    if (new Set(selectedIds).size !== selectedIds.length) {
      throw new Error("Duplicate cart items are not allowed");
    }

    // 2. Find and lock customer's active cart
    const cart = await Cart.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cart) {
      throw new Error("Active cart not found");
    }

    // 3. Validate selected delivery address
    if (!cart.selected_address_id) {
      throw new Error("Please select a delivery address");
    }

    const address = await Address.findOne({
      where: {
        id: cart.selected_address_id,
        user_id: userId,
      },
      transaction,
    });

    if (!address) {
      throw new Error("Selected delivery address not found");
    }

    // 4. Fetch only the selected cart items
    const cartItems = await CartItem.findAll({
      where: {
        cart_id: cart.id,
        id: {
          [Op.in]: selectedIds,
        },
      },
      include: [
        {
          model: ProductVariant,
          as: "variant",
          required: true,
          include: [
            {
              model: Product,
              as: "product",
              required: true,
            },
          ],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (cartItems.length !== selectedIds.length) {
      throw new Error("One or more selected cart items are invalid");
    }

    // 5. Prepare order lines and calculate delivery dates
    let totalAmount = 0;

    const orderLines = cartItems.map((cartItem) => {
      const requestedItem = normalizedItems.find(
        (item) => item.cart_item_id === cartItem.id
      );

      const variant = cartItem.variant;
      const product = variant?.product;

      if (!variant || !product) {
        throw new Error("Product or variant not found");
      }

      // Change these values if your database uses different ENUM values.
      if (product.status !== "published") {
        throw new Error(
          `Product ${product.product_name} is not available`
        );
      }

      if (variant.status !== "active") {
        throw new Error("Selected product variant is not active");
      }

      // POD fulfilment is not handled by this inventory flow.
      // if (variant.seller_type === "POD") {
      //   throw new Error(
      //     "Print-on-demand checkout is not available yet"
      //   );
      // }

      const unitPrice = Number(
        variant.sale_price ?? variant.price
      );

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error("Invalid product price");
      }

      const quantity = requestedItem.quantity;
      const lineTotal = unitPrice * quantity;

      // Delivery duration is read from the variant.
      const expectedDeliveryDate =
        // this.calculateExpectedDeliveryDate(variant.delivery_date);
        this.formatDate(variant.delivery_date);

      totalAmount += lineTotal;

      return {
        cart_item_id: cartItem.id,
        variant_id: variant.id,
        product_name: product.product_name,
        sku: variant.sku,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        expected_delivery_date: expectedDeliveryDate,
      };
    });

    // 6. Overall order delivery date = latest item delivery date
    const orderExpectedDeliveryDate = orderLines
      .map((item) => item.expected_delivery_date)
      .sort()
      .at(-1);

    // 7. Create order
    const orderNumber = `ORD-${crypto.randomUUID()}`;

    const reservationExpiry = new Date(
      Date.now() + 15 * 60 * 1000
    );

    const order = await Order.create(
      {
        user_id: userId,
        order_number: orderNumber,
        address_id: address.id,
        status: "PENDING_PAYMENT",
        payment_status: "PAID",
        payment_method,
        total_amount: totalAmount,

        // Overall expected delivery date
        expected_delivery_date: orderExpectedDeliveryDate,
      },
      { transaction }
    );

    // 8. Create order items and reserve inventory
    for (const line of orderLines) {
      const orderItem = await OrderItem.create(
        {
          order_id: order.id,
          variant_id: line.variant_id,
          quantity: line.quantity,
          unit_price: line.unit_price,

          // Individual product expected delivery date
          expected_delivery_date: line.expected_delivery_date,
        },
        { transaction }
      );

      // 9. Find and lock inventory rows for this variant
      // const inventories = await Inventory.findAll({
      //   where: {
      //     variant_id: line.variant_id,
      //   },
      //   order: [
      //     ["warehouse_id", "ASC"],
      //     ["id", "ASC"],
      //   ],
      //   transaction,
      //   lock: transaction.LOCK.UPDATE,
      // });

      // const totalAvailable = inventories.reduce(
      //   (total, inventory) => {
      //     return (
      //       total +
      //       (
      //         Number(inventory.quantity_available) -
      //         Number(inventory.quantity_reserved)
      //       )
      //     );
      //   },
      //   0
      // );

      // if (totalAvailable < line.quantity) {
      //   throw new Error(
      //     `Insufficient stock for variant ${line.variant_id}`
      //   );
      // }

      // // 10. Reserve stock across warehouses
      // let remainingQuantity = line.quantity;

      // for (const inventory of inventories) {
      //   if (remainingQuantity <= 0) break;

      //   const availableQuantity =
      //     Number(inventory.quantity_available) -
      //     Number(inventory.quantity_reserved);

      //   if (availableQuantity <= 0) continue;

      //   const reserveQuantity = Math.min(
      //     availableQuantity,
      //     remainingQuantity
      //   );

      //   await inventory.increment(
      //     "quantity_reserved",
      //     {
      //       by: reserveQuantity,
      //       transaction,
      //     }
      //   );

      //   await InventoryReservation.create(
      //     {
      //       order_id: order.id,
      //       order_item_id: orderItem.id,
      //       inventory_id: inventory.id,
      //       variant_id: line.variant_id,
      //       quantity: reserveQuantity,
      //       status: "ACTIVE",
      //       expires_at: reservationExpiry,
      //     },
      //     { transaction }
      //   );

      //   remainingQuantity -= reserveQuantity;
      // }

      // if (remainingQuantity > 0) {
      //   throw new Error(
      //     `Unable to reserve complete stock for variant ${line.variant_id}`
      //   );
      // }

      // 11. Update selected cart item quantity
      await CartItem.update(
        {
          quantity: line.quantity,
        },
        {
          where: {
            id: line.cart_item_id,
            cart_id: cart.id,
          },
          transaction,
        }
      );
    }

    // 12. Commit transaction
    await transaction.commit();

    return {
      success: true,
      message: "Order created successfully",
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        total_amount: totalAmount,

        // Overall expected delivery date
        expected_delivery_date: orderExpectedDeliveryDate,

        address_id: address.id,
        reservation_expires_at: reservationExpiry,

        items: orderLines.map((line) => ({
          cart_item_id: line.cart_item_id,
          variant_id: line.variant_id,
          product_name: line.product_name,
          sku: line.sku,
          quantity: line.quantity,
          unit_price: line.unit_price,
          line_total: line.line_total,

          // Individual expected delivery date
          expected_delivery_date: line.expected_delivery_date,
        })),
      },
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
}
   async getCheckoutSummary(userId, itemIds) {

    const cart = await Cart.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Parse selected cart item IDs
    let selectedIds = [];

    if (itemIds) {
      selectedIds = itemIds
        .split(",")
        .map(id => Number(id.trim()));

      if (
        selectedIds.some(id => !Number.isInteger(id) || id <= 0)
      ) {
        throw new Error("Invalid cart item IDs");
      }
    }

    const itemWhere = {
      cart_id: cart.id,
    };

    // If IDs are provided, fetch only those selected items.
    // Otherwise, fetch all items in the cart.
    if (selectedIds.length > 0) {
      itemWhere.id = selectedIds;
    }

    const cartItems = await CartItem.findAll({
      where: itemWhere,
      include: [
        {
          model: ProductVariant,
          as: "variant",
          required: true,
          include: [
            {
              model: Product,
              as: "product",
              required: true,
              attributes: [
                "id",
                "product_name",
                "status",
              ],
              where: {
                status: "PUBLISHED",
              },
            },
            {
              model: ProductVariantImage,
              as: "images",
              required: false,
              attributes: [
                "id",
                "image_url",
                "display_order",
              ],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    if (!cartItems.length) {
      throw new Error("No selected cart items found");
    }

    // Make sure every requested item belongs to this cart
    if (
      selectedIds.length &&
      cartItems.length !== new Set(selectedIds).size
    ) {
      throw new Error(
        "One or more selected cart items are invalid"
      );
    }

    let subtotal = 0;

    const items = cartItems.map(item => {

      const variant = item.variant;

      const unitPrice = Number(
        variant.sale_price || variant.price
      );

      const quantity = Number(item.quantity);
      const itemSubtotal = unitPrice * quantity;

      subtotal += itemSubtotal;

      return {
        cart_item_id: item.id,

        product_id: variant.product.id,
        product_name: variant.product.name,

        variant_id: variant.id,

        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        fit: variant.fit,

        quantity,

        unit_price: unitPrice,
        item_subtotal: Number(itemSubtotal.toFixed(2)),

        images: variant.images || [],
      };
    });

    // Fetch selected delivery address, if one exists
    let selectedAddress = null;

    if (cart.selected_address_id) {
      selectedAddress = await Address.findOne({
        where: {
          id: cart.selected_address_id,
          user_id: userId,
        },
      });
    }

    return {
      cart_id: cart.id,

      selected_address: selectedAddress,

      items,

      pricing: {
        subtotal: Number(subtotal.toFixed(2)),
        delivery_charge: 0,
        discount: 0,
        total_amount: Number(subtotal.toFixed(2)),
      },
    };
  }
  // SELECT OR CHANGE DELIVERY ADDRESS
  async selectDeliveryAddress(userId, addressId) {

    const parsedAddressId = Number(addressId);

    if (
      !Number.isInteger(parsedAddressId) ||
      parsedAddressId <= 0
    ) {
      throw new Error("Invalid address ID");
    }

    const cart = await Cart.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Verify that this address belongs to the logged-in customer
    const address = await Address.findOne({
      where: {
        id: parsedAddressId,
        user_id: userId,
      },
    });

    if (!address) {
      throw new Error(
        "Address not found or does not belong to this customer"
      );
    }

    await cart.update({
      selected_address_id: address.id,
    });

    return {
      message: "Delivery address selected successfully",
      selected_address: address,
    };
  }

}

module.exports = new CheckoutService();