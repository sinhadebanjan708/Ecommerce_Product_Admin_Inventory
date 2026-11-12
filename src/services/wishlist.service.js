const {
  sequelize,
  Wishlist,
  WishlistItem,
  Product,
  ProductVariant,
  ProductVariantImage,
  CartItem
} = require("../models");
const wishlist = require("../models/wishlist");

const cartService = require("./cart.service")

class WishlistService {
async getOrCreateWishlist(userId) {

  let wishlist = await Wishlist.findOne({
    where: {
      user_id: userId,
      status: "active"
    }
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user_id: userId,
      status: "active"
    });
  }

  return wishlist;
}

async getWishlist(userId) {

  const wishlist = await Wishlist.findOne({ user_id : userId});

  const items = await WishlistItem.findAll({

    where: {
      wishlist_id: wishlist.id
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

  return {
    wishlist_id: wishlist.id,
    total_items: items.length,
    items
  };
}

async addToWishlist(userId, data) {

  const variant = await ProductVariant.findOne({
    where: {
      id: data.variant_id,
      status: "ACTIVE"
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
    ]
  });

  if (!variant) {
    throw new Error("Product variant not available");
  }

  const wishlist = await this.getOrCreateWishlist(userId);

  const existingItem = await WishlistItem.findOne({
    where: {
      wishlist_id: wishlist.id,
      variant_id: variant.id
    }
  });

  if (existingItem) {
    return {
      message: "Product already exists in wishlist",
      item: existingItem
    };
  }

  const item = await WishlistItem.create({
    wishlist_id: wishlist.id,
    variant_id: variant.id
  });

  return {
    message: "Product added to wishlist successfully",
    item
  };
}

async removeWishlistItem(userId, itemId) {

  const wishlist = await Wishlist.findOne({
    where: {
      user_id: userId,
      status: "active"
    }
  });

  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  const item = await WishlistItem.findOne({
    where: {
      id: itemId,
      wishlist_id: wishlist.id
    }
  });

  if (!item) {
    throw new Error("Wishlist item not found");
  }

  await item.destroy();

  return {
    message: "Wishlist item removed successfully"
  };
}

async clearWishlist(userId) {

  const wishlist = await Wishlist.findOne({
    where: {
      user_id: userId,
      status: "active"
    }
  });

  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  await WishlistItem.destroy({
    where: {
      wishlist_id: wishlist.id
    }
  });

  return {
    message: "Wishlist cleared successfully"
  };
}

async moveToCart(userId, itemId) {

  const transaction = await sequelize.transaction();

  try {

    const wishlist = await Wishlist.findOne({
      where: {
        user_id: userId,
        status: "active"
      },
      transaction
    });

    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const wishlistItem = await WishlistItem.findOne({
      where: {
        id: itemId,
        wishlist_id: wishlist.id
      },
      transaction
    });

    if (!wishlistItem) {
      throw new Error("Wishlist item not found");
    }

    const variant = await ProductVariant.findByPk(
      wishlistItem.variant_id,
      { transaction }
    );

    console.log('variant_wishlist',variant)
    if (!variant || variant.status !== "active") {
      throw new Error("Product variant unavailable");
    }

    const product = await Product.findOne({
      where: {
        id: variant.product_id,
        status: "PUBLISHED"
      },
      transaction
    });

    if (!product) {
      throw new Error("Product is not available");
    }

    const cart = await cartService.getOrCreateCart(
      userId,
      transaction
    );

    const existingCartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        variant_id: variant.id
      },
      transaction
    });

    const newQuantity = existingCartItem
      ? existingCartItem.quantity + 1
      : 1;

    if (variant.seller_type === "Inventory") {

      const inventories = await Inventory.findAll({
        where: {
          variant_id: variant.id
        },
        transaction
      });

      const stock = inventories.reduce(
        (total, record) =>
          total +
          Number(record.quantity_available) -
          Number(record.quantity_reserved),
        0
      );

      if (newQuantity > stock) {
        throw new Error("Insufficient stock");
      }
    }

    if (existingCartItem) {

      existingCartItem.quantity = newQuantity;

      await existingCartItem.save({ transaction });

    } else {

      await CartItem.create({
        cart_id: cart.id,
        variant_id: variant.id,
        quantity: 1
      }, { transaction });
    }

    await wishlistItem.destroy({ transaction });

    await transaction.commit();

    return {
      message: "Wishlist item moved to cart successfully"
    };

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
}
}
module.exports = new WishlistService();
