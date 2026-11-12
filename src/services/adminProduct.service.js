const {
  sequelize,
  Product,
  ProductVariant,
  ProductVariantImage,
  Inventory,
  StockMovement,
  LowStockAlert,
  Warehouse
} = require("../models");

const { Op } = require("sequelize");
// const warehouse = require("../models/warehouse");
class AdminProductService {
    
    
async createProduct(data, adminId , imageFile) {
  return sequelize.transaction(async (transaction) => {

    // 1. Validate product
    if (!data.name || !data.slug) {
      throw new Error("Product name and slug are required");
    }

    if (!data.category_id) {
      throw new Error("Product category is required");
    }
    if (!data.subcategory_id) {
      throw new Error("Product subcategory is required");
    }

    // if (!Array.isArray(data.variants) || data.variants.length === 0) {
    //   throw new Error("At least one product variant is required");
    // }

        // 2. Validate image
    if (!imageFile) {
      throw new Error("Product image is required");
    }


    // 2. Create product
    const product = await Product.create(
      {
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        created_by:1,
        product_name: data.name,
        slug: data.slug,
        description: data.description || null,
        base_price: data.base_price,
        status: "draft",
        created_by: adminId,
        image: `/uploads/product/${imageFile.filename}`,
      },
      { transaction }
    );

    // 7. Return created product with variants and inventory
    return Product.findByPk(product.id, {
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

async createVariant(productId, data, adminId , imageFiles = []) {
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

  const deliveryDate = new Date(data.delivery_date);
  const currentDate = new Date();
  let formattedDate ;
  let dateCount;

deliveryDate.setHours(0, 0, 0, 0);
currentDate.setHours(0, 0, 0, 0);

if (deliveryDate.getTime() !== currentDate.getTime()) {

    const daysToAdd = 5; // or 6

    const postDaysCalculate = new Date(currentDate);

    postDaysCalculate.setDate(
        postDaysCalculate.getDate() + daysToAdd
    );

    // Format as YYYY-MM-DD
     formattedDate = [
        postDaysCalculate.getFullYear(),
        String(postDaysCalculate.getMonth() + 1).padStart(2, "0"),
        String(postDaysCalculate.getDate()).padStart(2, "0")
    ].join("-");

    // Calculate date difference in days
     dateCount = Math.round(
        (postDaysCalculate - currentDate) / (1000 * 60 * 60 * 24)
    );
  }

    // 3. Validate warehouse for inventory products
    let warehouse = null;
    let inventory = null;


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
        created_by: adminId,
        seller_type: data.seller_type,
        delivery_date: formattedDate
      },
      { transaction }
    );

        // 5. Save variant images
if (imageFiles.length > 0) {

  const imageRecords = imageFiles.map((file, index) => ({
    variant_id: variant.id,
    image_url: `/uploads/productvariant/${file.filename}`,
    display_order: index + 1
  }));

  await ProductVariantImage.bulkCreate(
    imageRecords,
    { transaction }
  );
}

    // 5. Create inventory for inventory-based products
    if (data.seller_type === "Inventory") {

      
  
      if (!data.warehouse_id) {
        throw new Error("Warehouse is required for inventory products");
      }

      warehouse = await Warehouse.findByPk(data.warehouse_id, {
        transaction
      });

      if (!warehouse) {
        throw new Error("Warehouse not found");
      }
      console.log('warehous_detail',warehouse)
    
      inventory = await Inventory.create(
        {
          variant_id: variant.id,
          warehouse_id: warehouse.id,
          quantity_available: data.quantity_available ?? 0,
          quantity_reserved: data.quantity_reserved ?? 0,
          reorder_level: data.reorder_level ?? 0,
          created_by: adminId
        },
        { transaction }
      );

      // 6. Record initial stock movement
      if (
        Number(data.quantity_available ?? 0) > 0 ||
        Number(data.quantity_reserved ?? 0) > 0
      ) {
        await StockMovement.create(
          {
            warehouse_id: inventory.warehouse_id,
            variant_id: variant.id,
            movement_type: "INITIAL_STOCK",
            quantity_change: Number(data.quantity_available ?? 0),
            quantity_on_hand_after: inventory.quantity_available,
            quantity_reserved_after: inventory.quantity_reserved,
            reference_type: "PRODUCT_CREATION",
            reference_id: product.id,
            reason: "Initial product stock",
            created_by: adminId
          },
          { transaction }
        );
      }
    }

    // 7. Commit once
    await transaction.commit();

    // 8. Return result
    if (data.seller_type === "POD") {
      return {
        message: "POD request queued",
        status: true,
        variant,
        delivery_date_count:dateCount
      };
    }

    return {
      message: "Inventory variant created successfully",
      status: true,
      variant,
      inventory,
      images: imageFiles.map(file =>
        `/uploads/productvariant/${file.filename}`
      )
    };

  } catch (error) {
    // Rollback only if transaction has not already finished
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
}

async updateVariant(productId ,variantId, data, adminId) {
  const transaction = await sequelize.transaction();

  try {
    const variant = await ProductVariant.findOne({
        where: {
          id: variantId,
          product_id: productId
        }
      });
    

    if (!variant) {
      throw new Error("Product variant not found");
    }

    const sellerType = String(
      data.seller_type ?? variant.seller_type
    );

    // Update ProductVariant fields
    await variant.update(
      {
        sku: data.sku ?? variant.sku,
        color: data.color ?? variant.color,
        size: data.size ?? variant.size,
        price: data.price ?? variant.price,
        sale_price: data.sale_price ?? variant.sale_price,
        fit: data.fit ?? variant.fit,
        status: data.status ?? variant.status,
        seller_type: sellerType,
        delivery_date:data.delivery_date,
        updated_by: adminId,
      },
      { transaction }
    );

    if (sellerType === "Inventory") {
      const inventory = await Inventory.findOne({
        where: { variant_id: variant.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory) {
        throw new Error("Inventory record not found for this variant");
      }

      const oldAvailable = Number(inventory.quantity_available);
      const newAvailable =
        data.quantity_available !== undefined
          ? Number(data.quantity_available)
          : oldAvailable;

      const oldReserved = Number(inventory.quantity_reserved);
      const newReserved =
        data.quantity_reserved !== undefined
          ? Number(data.quantity_reserved)
          : oldReserved;

      const availableDelta = newAvailable - oldAvailable;
      const reservedDelta = newReserved - oldReserved;

      await inventory.update(
        {
          quantity_available: newAvailable,
          quantity_reserved: newReserved,
          reorder_level:
            data.reorder_level ?? inventory.reorder_level,
          warehouse_id:
            data.warehouse_id ?? inventory.warehouse_id,
          updated_by: adminId,
        },
        { transaction }
      );

      console.log('insert__', availableDelta, reservedDelta)
      // Record stock movement only if quantity changed
      if (availableDelta !== 0 || reservedDelta !== 0) {
        await StockMovement.create(
          {
            variant_id: variant.id,
            warehouse_id:
              data.warehouse_id ?? inventory.warehouse_id,
            movement_type: "ADJUSTMENT",
            quantity_on_hand_after: availableDelta,
            quantity_change:0,
            quantity_reserved_after: reservedDelta,
            created_by: adminId,
            reference_type:"PRODUCT_UPDATAION"
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return {
      message: "Variant updated successfully",
      variant,
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
}
    
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

let updateStatus= null;
if (product.status !== "active" || product.status !== "draft") {
  throw new Error("Only active or drafted products can be submitted");
}

if (!product.variants || product.variants.length === 0) {
  throw new Error("Product must have at least one variant");
}

for (const variant of product.variants) {
  if (!variant.sku || Number(variant.price) <= 0) {
    throw new Error("Each variant requires a valid SKU and price");
  }
}
  if(product.status == "active" || product.status == "draft"){
    updateStatus = await Product.update(
            {
                status: "draft"
            },
            {
                where: {
                id: product.id
                }
            }
          );
}
// This indicates the product passed validation.
// Publishing is a separate action.
return {
  productId: product.id,
  status:updateStatus.status,
  validForPublishing: true
};
};
    
async publishProduct (productId, adminId) {
const product = await this.getProductById(productId);

  console.log("Product ID:", product.id);
console.log("Product Name:", product.product_name);
console.log("Product Status:", product.status);
//   console.log("Product Variants:", product.variants);
  

if (product.status !== "active" || product.status !== "draft") {
  throw new Error("Only active or drafted products can be published");
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
    
    // async archiveProduct (productId, adminId) {
    //   const product = await Product.findByPk(productId);
    
    //   if (!product) {
    //     throw new Error("Product not found");
    //   }
    
    //   await product.update({
    //     status: "ARCHIVED",
    //     archived_at: new Date(),
    //     updated_by: adminId
    //   });
    
    //   return product;
    // };
    
    // async restoreProduct (productId, adminId) {
    //   const product = await Product.findByPk(productId);
    
    //   if (!product || product.status !== "ARCHIVED") {
    //     throw new Error("Archived product not found");
    //   }
    
    //   await product.update({
    //     status: "DRAFT",
    //     archived_at: null,
    //     updated_by: adminId
    //   });
    
    //   return product;
    // };


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