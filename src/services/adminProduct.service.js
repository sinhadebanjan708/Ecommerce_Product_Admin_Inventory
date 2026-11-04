const {
  sequelize,
  Product,
  ProductVariant,
  Inventory,
  StockMovement,
  LowStockAlert,
  Warehouse
} = require("../models");

const { Op } = require("sequelize");
// const warehouse = require("../models/warehouse");
class AdminProductService {
    
    
async createProduct(data, adminId) {
  return sequelize.transaction(async (transaction) => {

    // 1. Validate product
    if (!data.name || !data.slug) {
      throw new Error("Product name and slug are required");
    }

    if (!data.category_id) {
      throw new Error("Product category is required");
    }

    if (!Array.isArray(data.variants) || data.variants.length === 0) {
      throw new Error("At least one product variant is required");
    }

    // 2. Create product
    const product = await Product.create(
      {
        category_id: data.category_id,
        created_by:1,
        product_name: data.name,
        slug: data.slug,
        description: data.description || null,
        base_price: data.base_price,
        status: "draft",
        created_by: adminId
      },
      { transaction }
    );

    // 3. Create variants and inventory
    for (const variantData of data.variants) {

      if (!variantData.sku || variantData.price == null) {
        throw new Error("Each variant requires SKU and price");
      }

      const initialStock = Number(variantData.initial_stock ?? 0);

      if (!Number.isInteger(initialStock) || initialStock < 0) {
        throw new Error("Initial stock must be a non-negative integer");
      }

      const reorderLevel = Number(
        variantData.reorder_level ?? 5
      );

      if (!Number.isInteger(reorderLevel) || reorderLevel < 0) {
        throw new Error("Reorder level must be a non-negative integer");
      }

      // 4. Create product variant
      const variant = await ProductVariant.create(
        {
          product_id: product.id,
          sku: variantData.sku,
          size: variantData.size || null,
          color: variantData.color || null,
          fit: variantData.fit || null,
          price: variantData.price,
          sale_price: variantData.sale_price ?? null,
          status: "active",
        },
        { transaction }
      );

      // 5. Create inventory
      const inventory = await Inventory.create(
        {
          variant_id: variant.id,
          warehouse_id: data.warehouse_id,
          quantity_on_hand: initialStock,
          quantity_reserved: 0,
          reorder_level: reorderLevel,
          updated_by: adminId,
        },
        { transaction }
      );

      // 6. Record initial stock movement
      if (initialStock > 0) {
        await StockMovement.create(
          {
            warehouse_id: inventory.warehouse_id,
            variant_id: variant.id,
            movement_type: "INITIAL_STOCK",
            quantity_change: initialStock,
            quantity_on_hand_after: inventory.quantity_available,
            quantity_reserved_after: inventory.quantity_reserved,
            reference_type: "PRODUCT_CREATION",
            reference_id: product.id,
            reason: "Initial product stock",
            created_by: adminId,
          },
          { transaction }
        );
      }
    }

    // 7. Return created product with variants and inventory
    return Product.findByPk(product.id, {
      include: [
        {
          model: ProductVariant,
          as: "variants",
          include: [
            {
              model: Inventory,
              as: "inventory",
            },
          ],
        },
      ],
      transaction,
    });
  });
}

    
async listProducts  ({
    page = 1,
    limit = 20,
    search,
    status
}) {
    const where = {};

    if (search) {
    where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
    ];
    }

    if (status) {
    where.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);

    return Product.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    order: [["created_at", "DESC"]],
    distinct: true
    });
};
    
    async getProductById (productId){
      const product = await Product.findByPk(productId, {
        include: [
          {
            model: ProductVariant,
            as: "variants",
            include: [{ model: Inventory, as: "inventory" }]
          }
        ]
      });
    
      if (!product) {
        throw new Error("Product not found");
      }
    
      return product;
    };

    
    
    async updateProduct (productId, data, adminId) {
      const product = await Product.findByPk(productId);
    
      if (!product || product.status === "ARCHIVED") {
        throw new Error("Product not found or archived");
      }
    
      const allowedFields = [
        "name",
        "slug",
        "description",
        "base_price",
        "status",
        "category_id",
        "status"
      ];
    
      const updates = {};
    
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updates[field] = data[field];
        }
      }

    
      updates.updated_by = adminId;
    
      await product.update(updates);
    
      return this.getProductById(productId);
    };
     async  createVariant (productId, data, adminId) {
        const transaction = await sequelize.transaction();
    
        try {
          // 1. Check whether product exists
          const product = await Product.findByPk(productId, {
            transaction
          });
    
          if (!product) {
            throw new Error("Product not found");
          }
    
          // 2. Check duplicate SKU
          const existingVariant = await ProductVariant.findOne({
            where: {
              sku: data.sku
            },
            transaction
          });
    
          if (existingVariant) {
            throw new Error("Variant SKU already exists");
          }
    
          // 3. Validate warehouse if supplied
          let warehouse = null;
    
          if (data.warehouse_id) {
            warehouse = await Warehouse.findByPk(data.warehouse_id, {
              transaction
            });
    
            if (!warehouse) {
              throw new Error("Warehouse not found");
            }
          }
    
          // 4. Create product variant
          const variant = await ProductVariant.create(
            {
              product_id: productId,
              sku: data.sku,
              status: data.status,
              color: data.color || null,
              size: data.size || null,
              price: data.price,
              sale_price: data.sale_price || null,
              fit: data.fit || null,
              created_by: adminId
            },
            { transaction }
          );
    
          // 5. Create inventory only if warehouse is supplied
          let inventory = null;
    
          if (warehouse) {
            inventory = await Inventory.create(
              {
                variant_id: variant.id,
                warehouse_id: data.warehouse_id,
                quantity_available: data.quantity_available ?? 0,
                quantity_reserved: data.quantity_reserved ?? 0,
                reorder_level: data.reorder_level ?? 0,
                created_by: adminId
              },
              { transaction }
            );
          }
    
          await transaction.commit();
    
          return {
            variant,
            inventory
          };
    
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }
    
    async updateVariant (productId, variantId, data) {
      const variant = await ProductVariant.findOne({
        where: {
          id: variantId,
          product_id: productId
        }
      });
    
      if (!variant) {
        throw new Error("Variant not found for this product");
      }
    
      const allowedFields = [
        "sku",
        "size",
        "color",
        "fit",
        "price",
        "sale_price",
        "status"
      ];
    
      const updates = {};
    
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updates[field] = data[field];
        }
      }
    
      await variant.update(updates);
    
      return variant;
    };
    
    async deleteVariant(productId, variantId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Check whether product exists
    const product = await Product.findByPk(productId, {
      transaction
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // 2. Find variant belonging to this product
    const variant = await ProductVariant.findOne({
      where: {
        id: variantId,
        product_id: productId
      },
      transaction
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    // 3. Delete associated inventory records
    await Inventory.destroy({
      where: {
        variant_id: variantId
      },
      transaction
    });

    // 4. Delete product variant
    await variant.destroy({
      transaction
    });

    // 5. Commit transaction
    await transaction.commit();

    return {
      product_id: productId,
      variant_id: variantId,
      sku: variant.sku
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
    async submitForPublishing (productId) {
      const product = await this.getProductById(productId);
    
      if(product.status !== "active"){
        const updateStatus = await Product.update(
                {
                    status: "active"
                },
                {
                    where: {
                    id: product.id
                    }
                }
                );
      }
      if (product.status !== "active") {
        throw new Error("Only active products can be submitted");
      }
    
      if (!product.variants || product.variants.length === 0) {
        throw new Error("Product must have at least one variant");
      }
    
      for (const variant of product.variants) {
        if (!variant.sku || Number(variant.price) <= 0) {
          throw new Error("Each variant requires a valid SKU and price");
        }
      }
      // This indicates the product passed validation.
      // Publishing is a separate action.
      return {
        productId: product.id,
        validForPublishing: true
      };
    };
    
    async publishProduct (productId, adminId) {
      const product = await this.getProductById(productId);

       console.log("Product ID:", product.id);
  console.log("Product Name:", product.product_name);
  console.log("Product Status:", product.status);
//   console.log("Product Variants:", product.variants);
        
    
      if (product.status !== "active") {
        throw new Error("Only active products can be published");
      }
    
      if (!product.variants?.length) {
        throw new Error("Product must have at least one variant");
      }
    
      for (const variant of product.variants) {
        if (!variant.status || Number(variant.price) <= 0) {
          throw new Error("All published variants must be active and priced");
        }
      }
    
      await product.update({
        status: "published",
        updated_by: adminId,
        published_by: adminId
      });
    
      return this.getProductById(productId);
    };
    
    async archiveProduct (productId, adminId) {
      const product = await Product.findByPk(productId);
    
      if (!product) {
        throw new Error("Product not found");
      }
    
      await product.update({
        status: "ARCHIVED",
        archived_at: new Date(),
        updated_by: adminId
      });
    
      return product;
    };
    
    async restoreProduct (productId, adminId) {
      const product = await Product.findByPk(productId);
    
      if (!product || product.status !== "ARCHIVED") {
        throw new Error("Archived product not found");
      }
    
      await product.update({
        status: "DRAFT",
        archived_at: null,
        updated_by: adminId
      });
    
      return product;
    };


    async adjustStock  (
  variantId,
  { quantity, reason },
  adminId
){
  if (!Number.isInteger(quantity) || quantity === 0) {
    throw new Error("Quantity must be a non-zero integer");
  }

  return sequelize.transaction(async (transaction) => {
    const inventory = await Inventory.findOne({
      where: { variant_id: variantId },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const nextOnHand = inventory.on_hand + quantity;

    if (nextOnHand < inventory.reserved) {
      throw new Error(
        "Cannot reduce stock below the currently reserved quantity"
      );
    }

    await inventory.update(
      { on_hand: nextOnHand },
      { transaction }
    );

    await StockMovement.create(
      {
        variant_id: variantId,
        movement_type: "ADJUSTMENT",
        quantity_change: quantity,
        on_hand_after: nextOnHand,
        reserved_after: inventory.reserved,
        admin_user_id: adminId,
        reason
      },
      { transaction }
    );

    await checkLowStock(variantId, inventory, transaction);

    return inventory;
  });
};

async reserveStock (variantId, quantity, orderId) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Reservation quantity must be positive");
  }

  return sequelize.transaction(async (transaction) => {
    const inventory = await Inventory.findOne({
      where: { variant_id: variantId },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const available = inventory.on_hand - inventory.reserved;

    if (available < quantity) {
      throw new Error("Insufficient available stock");
    }

    const nextReserved = inventory.reserved + quantity;

    await inventory.update(
      { reserved: nextReserved },
      { transaction }
    );

    await StockMovement.create(
      {
        variant_id: variantId,
        movement_type: "RESERVE",
        quantity_change: quantity,
        on_hand_after: inventory.on_hand,
        reserved_after: nextReserved,
        reason: `Order reservation: ${orderId}`
      },
      { transaction }
    );

    await checkLowStock(variantId, inventory, transaction);

    return inventory;
  });
};

async releaseStock (variantId, quantity, reason) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Release quantity must be positive");
  }

  return sequelize.transaction(async (transaction) => {
    const inventory = await Inventory.findOne({
      where: { variant_id: variantId },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (inventory.reserved < quantity) {
      throw new Error("Cannot release more than reserved stock");
    }

    const nextReserved = inventory.reserved - quantity;

    await inventory.update(
      { reserved: nextReserved },
      { transaction }
    );

    await StockMovement.create(
      {
        variant_id: variantId,
        movement_type: "RELEASE",
        quantity_change: -quantity,
        on_hand_after: inventory.on_hand,
        reserved_after: nextReserved,
        reason
      },
      { transaction }
    );

    await checkLowStock(variantId, inventory, transaction);

    return inventory;
  });
};

async checkLowStock  (
  variantId,
  inventory,
  transaction
) {
  const availableStock =
    inventory.on_hand - inventory.reserved;

  const threshold = inventory.low_stock_threshold;

  if (availableStock <= threshold) {
    const existingAlert = await LowStockAlert.findOne({
      where: {
        variant_id: variantId,
        status: "OPEN"
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!existingAlert) {
      await LowStockAlert.create(
        {
          variant_id: variantId,
          available_stock: availableStock,
          threshold,
          status: "OPEN"
        },
        { transaction }
      );
    } else {
      await existingAlert.update(
        {
          available_stock: availableStock,
          threshold
        },
        { transaction }
      );
    }
  } else {
    await LowStockAlert.update(
      { status: "RESOLVED" },
      {
        where: {
          variant_id: variantId,
          status: {
            [Op.in]: ["OPEN", "ACKNOWLEDGED"]
          }
        },
        transaction
      }
    );
  }
};

async getLowStock()  {
  return Inventory.findAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.literal("`on_hand` - `reserved`"),
          { [Op.lte]: sequelize.col("low_stock_threshold") }
        )
      ]
    },
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
  });
};

async acknowledgeAlert (alertId, adminId) {
  const alert = await LowStockAlert.findByPk(alertId);

  if (!alert || alert.status !== "OPEN") {
    throw new Error("Open alert not found");
  }

  await alert.update({
    status: "ACKNOWLEDGED",
    acknowledged_by: adminId,
    acknowledged_at: new Date()
  });

  return alert;
};

async updateThreshold (variantId, threshold) {
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error("Threshold must be a non-negative integer");
  }

  const inventory = await Inventory.findOne({
    where: { variant_id: variantId }
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  await inventory.update({
    low_stock_threshold: threshold
  });

  await sequelize.transaction(async (transaction) => {
    await checkLowStock(variantId, inventory, transaction);
  });

  return inventory;
};

}
module.exports = new AdminProductService();