const {
  Cart,
  CartItem,
  ProductVariant,
  Product
} = require("../models");

class CartService {

  async getCart(userId) {
    return Cart.findOne({
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
      ]
    });
  }

  async addItem(userId, variantId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be a positive integer");
    }

    const variant = await ProductVariant.findOne({
      where: {
        id: variantId,
        status: "active"
      },
      include: [
        {
          model: Product,
          as: "product",
          where: { status: "published" }
        }
      ]
    });

    if (!variant) {
      throw new Error("Variant is not available");
    }

    let cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId
      });
    }

    const [cartItem, created] = await CartItem.findOrCreate({
      where: {
        cart_id: cart.id,
        variant_id: variantId
      },
      defaults: {
        cart_id: cart.id,
        variant_id: variantId,
        quantity
      }
    });

    if (!created) {
      await cartItem.update({
        quantity: Number(cartItem.quantity) + quantity
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId, itemId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be a positive integer");
    }

    const cart = await Cart.findOne({
      where: { user_id: userId }
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

    await item.update({ quantity });

    return this.getCart(userId);
  }

  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const deleted = await CartItem.destroy({
      where: {
        id: itemId,
        cart_id: cart.id
      }
    });

    if (!deleted) {
      throw new Error("Cart item not found");
    }

    return this.getCart(userId);
  }
}

module.exports = new CartService();