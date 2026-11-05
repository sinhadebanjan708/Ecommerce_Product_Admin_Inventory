const {
  Product,
  ProductVariant,
  ProductImage,
  Inventory
} = require("../models");

class CustomerProductService {

  async getProducts(filters = {}) {
    const where = {
      status: "published"
    };

    if (filters.category_id) {
      where.category_id = filters.category_id;
    }

    if (filters.search) {
      const { Op } = require("sequelize");

      where.product_name = {
        [Op.like]: `%${filters.search}%`
      };
    }

    return Product.findAll({
      where,
      include: [
        {
          model: ProductImage,
          as: "images"
        },
        {
          model: ProductVariant,
          as: "variants",
          where: {
            status: "active"
          },
          required: false,
          include: [
            {
              model: Inventory,
              as: "inventories",
              attributes: [
                "quantity_available",
                "quantity_reserved"
              ],
              required: false
            }
          ]
        }
      ]
    });
  }

  async getProductDetails(productId) {
    const product = await Product.findOne({
      where: {
        id: productId,
        status: "published"
      },
      include: [
        {
          model: ProductImage,
          as: "images"
        },
        {
          model: ProductVariant,
          as: "variants",
          where: {
            status: "active"
          },
          required: false,
          include: [
            {
              model: Inventory,
              as: "inventories",
              required: false
            }
          ]
        }
      ]
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async checkAvailability(variantId) {
    const variant = await ProductVariant.findOne({
      where: {
        id: variantId,
        status: "active"
      },
      include: [
        {
          model: Product,
          as: "product",
          where: {
            status: "published"
          }
        },
        {
          model: Inventory,
          as: "inventories",
          required: false
        }
      ]
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    // POD variants need a separate fulfilment/availability check.
    if (variant.seller_type === "POD") {
      return {
        available: true,
        seller_type: "POD",
        message: "Available for print-on-demand"
      };
    }

    const inventory = variant.inventories || [];

    const availableQuantity = inventory.reduce(
      (total, item) =>
        total +
        Number(item.quantity_available) -
        Number(item.quantity_reserved),
      0
    );

    return {
      variant_id: variant.id,
      seller_type: variant.seller_type,
      available_quantity: availableQuantity,
      in_stock: availableQuantity > 0,
      message:
        availableQuantity > 0
          ? "In stock"
          : "Out of stock"
    };
  }
}

module.exports = new CustomerProductService();