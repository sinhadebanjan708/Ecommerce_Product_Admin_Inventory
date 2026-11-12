const {
  Cart,
  CartItem,
  ProductVariant,
  ProductVariantImage,
  Product,
  sequelize
} = require("../models");

const { Op, } = require("sequelize");
class CartService {

  // async getCart(userId) {
  //   return Cart.findOne({
  //     where: { user_id: userId },
  //     include: [
  //       {
  //         model: CartItem,
  //         as: "items",
  //         include: [
  //           {
  //             model: ProductVariant,
  //             as: "variant",
  //             include: [
  //               {
  //                 model: Product,
  //                 as: "product"
  //               },
  //               {
  //                 model: ProductVariantImage,
  //                 as: "images",
  //                 required: false,
  //                 attributes: [
  //                   "id",
  //                   "image_url",
  //                   "display_order"
  //                 ]
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     ],
  //      order: [["created_at", "DESC"]]
  //   });
  // }
  async getCart(userId) {

  const cart = await this.getOrCreateCart(userId);

  const cartItems = await CartItem.findAll({
    where: {
      cart_id: cart.id
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
            required: true
          },
          {
            model: ProductVariantImage,
            as: "images",
            required: false,
            attributes: [
              "id",
              "image_url",
              "display_order"
            ]
          }
        ]
      }
    ],

    order: [["created_at", "DESC"]]
  });

  let subtotal = 0;

  const items = cartItems.map(item => {

    const variant = item.variant;

    const price = Number(
      variant.sale_price || variant.price
    );

    const itemTotal = price * item.quantity;

    subtotal += itemTotal;

    return {
      id: item.id,
      variant_id: variant.id,
      quantity: item.quantity,
      size:item.size,

      product: {
        id: variant.product.id,
        name: variant.product.name
      },

      variant: {
        id: variant.id,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        price: Number(variant.price),
        sale_price: variant.sale_price
          ? Number(variant.sale_price)
          : null,
        selected_price: price,
        status: variant.status
      },

      images: variant.images,

      item_total: Number(itemTotal.toFixed(2))
    };
  });

  return {
    cart_id: cart.id,
    status: cart.status,
    total_items: items.length,
    total_quantity: items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    subtotal: Number(subtotal.toFixed(2)),
    items
  };
}
  async getOrCreateCart(userId, transaction = null) {

  let cart = await Cart.findOne({
    where: {
      user_id: userId,
      status: "active"
    },
    transaction
  });

  if (!cart) {
    cart = await Cart.create(
      {
        user_id: userId,
        status: "active"
      },
      { transaction }
    );
  }

  return cart;
}

  // async addItem(userId, variantId, quantity) {
  //   if (!Number.isInteger(quantity) || quantity < 1) {
  //     throw new Error("Quantity must be a positive integer");
  //   }

  //   const variant = await ProductVariant.findOne({
  //     where: {
  //       id: variantId,
  //       status: "active"
  //     },
  //     include: [
  //       {
  //         model: Product,
  //         as: "product",
  //         where: { status: "published" }
  //       }
  //     ]
  //   });

  //   if (!variant) {
  //     throw new Error("Variant is not available");
  //   }

  //   let cart = await Cart.findOne({
  //     where: { user_id: userId }
  //   });

  //   if (!cart) {
  //     cart = await Cart.create({
  //       user_id: userId
  //     });
  //   }

  //   const [cartItem, created] = await CartItem.findOrCreate({
  //     where: {
  //       cart_id: cart.id,
  //       variant_id: variantId
  //     },
  //     defaults: {
  //       cart_id: cart.id,
  //       variant_id: variantId,
  //       quantity
  //     }
  //   });

  //   if (!created) {
  //     await cartItem.update({
  //       quantity: Number(cartItem.quantity) + quantity
  //     });
  //   }

  //   return this.getCart(userId);
  // }

async addToCart(userId, variant_id ,quantity) {

  const transaction = await sequelize.transaction();

  try {

    // const { variant_id, quantity = 1 } = data;

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      throw new Error("Quantity must be a positive integer");
    }

    // 1. Validate variant and product
   console.log('vr_id',variant_id)
    const variant = await ProductVariant.findOne({
      where: {
        id: variant_id,
        status: "active"
      },

      include: [
        {
          model: Product,
          as: "product",
          required: true,
          where: {
            status: "PUBLISHED"
          }
        }
      ],

      transaction
    });

    if (!variant) {
      throw new Error("Product variant not available");
    }

    // 2. Get or create cart

    const cart = await this.getOrCreateCart(
      userId,
      transaction
    );

    // 3. Check existing cart item

    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        variant_id: variant.id
      },
      transaction
    });

    const finalQuantity =
      (cartItem ? cartItem.quantity : 0) +
      requestedQuantity;

    // 4. Check stock for inventory products

    if (variant.seller_type === "Inventory") {

      const inventoryRecords = await Inventory.findAll({
        where: {
          variant_id: variant.id
        },
        transaction
      });

      const availableStock = inventoryRecords.reduce(
        (total, record) =>
          total +
          Number(record.quantity_available) -
          Number(record.quantity_reserved),
        0
      );

      if (finalQuantity > availableStock) {
        throw new Error(
          `Only ${Math.max(0, availableStock)} units available`
        );
      }
    }

    // 5. Create or update cart item

    if (cartItem) {

      cartItem.quantity = finalQuantity;

      await cartItem.save({ transaction });

    } else {

      cartItem = await CartItem.create(
        {
          cart_id: cart.id,
          variant_id: variant.id,
          quantity: requestedQuantity
        },
        { transaction }
      );
    }

    await transaction.commit();

    return {
      message: "Product added to cart successfully",
      cart_id: cart.id,
      cart_item: cartItem
    };

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
}


  // async updateItem(userId, itemId, quantity) {
  //   if (!Number.isInteger(quantity) || quantity < 1) {
  //     throw new Error("Quantity must be a positive integer");
  //   }

  //   const cart = await Cart.findOne({
  //     where: { user_id: userId }
  //   });

  //   if (!cart) {
  //     throw new Error("Cart not found");
  //   }

  //   const item = await CartItem.findOne({
  //     where: {
  //       id: itemId,
  //       cart_id: cart.id
  //     }
  //   });

  //   if (!item) {
  //     throw new Error("Cart item not found");
  //   }

  //   await item.update({ quantity });

  //   return this.getCart(userId);
  // }

  async updateCartItem(userId, itemId, quantity ,size) {
    console.log('user_id',userId)
  const requestedQuantity = Number(quantity);
  const requestedSize = String(size)

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    throw new Error("Invalid quantity");
  }

  const cart = await Cart.findOne({
    where: {
      user_id: userId,
      status: "active"
    }
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = await CartItem.findOne({
    where: {
      id: itemId,
      cart_id: cart.id
    },
    include: [
      {
        model: ProductVariant,
        as: "variant"
      }
    ]
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  const variant = item.variant;

  if (!variant || variant.status !== "active") {
    throw new Error("Product variant is unavailable");
  }

  if (variant.seller_type === "Inventory") {

    const inventories = await Inventory.findAll({
      where: {
        variant_id: variant.id
      }
    });

    const availableStock = inventories.reduce(
      (total, inventory) =>
        total +
        Number(inventory.quantity_available) -
        Number(inventory.quantity_reserved),
      0
    );

    if (requestedQuantity > availableStock) {
      throw new Error(
        `Only ${Math.max(0, availableStock)} units available`
      );
    }
  }

  item.quantity = requestedQuantity;
  item.size = requestedSize;

  await item.save();

  return {
    message: "Cart quantity updated successfully",
    cart_item: item
  };
}
async removeCartItem(userId, itemId) {

  const cart = await Cart.findOne({
    where: {
      user_id: userId,
      status: "active"
    }
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = await CartItem.findOne({
    where: {
      id: itemId,
      cart_id: cart.id
    }
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  await item.destroy();

  return {
    message: "Cart item removed successfully"
  };
}

async clearCart(userId) {

  const cart = await Cart.findOne({
    where: {
      user_id: userId,
      status: "active"
    }
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  await CartItem.destroy({
    where: {
      cart_id: cart.id
    }
  });

  return {
    message: "Cart cleared successfully"
  };
}
  // async removeItem(userId, itemId) {
  //   const cart = await Cart.findOne({
  //     where: { user_id: userId }
  //   });

  //   if (!cart) {
  //     throw new Error("Cart not found");
  //   }

  //   const deleted = await CartItem.destroy({
  //     where: {
  //       id: itemId,
  //       cart_id: cart.id
  //     }
  //   });

  //   if (!deleted) {
  //     throw new Error("Cart item not found");
  //   }

  //   return this.getCart(userId);
  // }
}

module.exports = new CartService();