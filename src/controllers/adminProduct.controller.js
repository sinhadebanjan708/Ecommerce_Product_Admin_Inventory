const productvariant = require("../models/productvariant");
const service = require("../services/adminProduct.service");

const getAdminId = (req) => req.user.user_id;

const handleError = (res, error) => {
  const status = [
    "Product not found",
    "Variant not found",
    "Inventory not found",
    "Archived product not found",
    "Open alert not found"
  ].includes(error.message)
    ? 404
    : 400;

  return res.status(status).json({
    success: false,
    message: error.message
  });
};

const createProduct = async (req, res) => {
  try {
    const product = await service.createProduct(
      req.body,
      getAdminId(req)
    );

    return res.status(201).json({
      success: true,
      message: "Product created as draft",
      data: product
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listProducts = async (req, res) => {
  try {
    const result = await service.listProducts(req.query);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: result.count,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20)
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await service.getProductById(
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log('admin_id', req.user)
    const product = await service.updateProduct(
      req.params.productId,
      req.body,
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: product
    });
  } catch (error) {
    return handleError(res, error);
  }
};


const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const adminId = req.user.user_id;

    const {
      sku,
      color,
      size,
      price,
      fit,
      sale_price,
      status,
      seller_type,
      delivery_date,
      warehouse_id,
      quantity_reserved,
      quantity_available,
      reorder_level
    } = req.body;

    // Basic validation
    if (!sku || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "SKU, variant name and price are required"
      });
    }

    if (Number(price) < 0 || !Number.isFinite(Number(price))) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number"
      });
    }

    if (
      warehouse_id &&
      ((quantity_reserved !== undefined &&
          (!Number.isInteger(Number(quantity_reserved)) || Number(quantity_reserved) < 0)) ||
        (quantity_available !== undefined &&
          (!Number.isInteger(Number(quantity_available)) || Number(quantity_available) < 0)) ||
        (reorder_level !== undefined &&
          (!Number.isInteger(Number(reorder_level)) || Number(reorder_level) < 0))
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity and reorder level must be non-negative integers"
      });
    }

    const result = await service.createVariant(
      productId,
      {
        sku,
        status,
        color,
        size,
        fit,
        price,
        sale_price,
        seller_type,
        delivery_date,
        warehouse_id,
        quantity_reserved,
        quantity_available,
        reorder_level
      },
      adminId
    );

    return res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: result
    });

  } catch (error) {
    console.error("Create variant error:", error);

    return res.status(
      error.message === "Product not found" ||
      error.message === "Warehouse not found" ? 404 :
      error.message === "Variant SKU already exists" ? 409 : 500
    ).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};


const updateVariant = async (req, res) => {
  try {
    const variant = await service.updateVariant(
      req.params.productId,
      req.params.variantId,
      req.body,
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Variant updated",
      data: variant
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    // Validate IDs
    if (
      !Number.isInteger(Number(productId)) ||
      !Number.isInteger(Number(variantId)) ||
      Number(productId) <= 0 ||
      Number(variantId) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID or variant ID"
      });
    }

    const result = await service.deleteVariant(
      productId,
      variantId
    );

    return res.status(200).json({
      success: true,
      message: "Product variant deleted successfully",
      data: result
    });

  } catch (error) {
    console.error("Delete variant error:", error);

    const statusCode =
      error.message === "Product not found" ||
      error.message === "Product variant not found"
        ? 404
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const submitForPublishing = async (req, res) => {
  try {
    const result = await service.submitForPublishing(
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      message: "Product passed publishing validation",
      data: result
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const publishProduct = async (req, res) => {
  try {
    const product = await service.publishProduct(
      req.params.productId,
      getAdminId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Product published",
      data: product
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const archiveProduct = async (req, res) => {
  try {
    const product = await service.archiveProduct(
      req.params.productId,
      getAdminId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Product archived",
      data: product
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const restoreProduct = async (req, res) => {
  try {
    const product = await service.restoreProduct(
      req.params.productId,
      getAdminId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Product restored as draft",
      data: product
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const adjustStock = async (req, res) => {
  try {
    const inventory = await service.adjustStock(
      req.params.variantId,
      req.body,
      getAdminId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Stock adjusted",
      data: inventory
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const reserveStock = async (req, res) => {
  try {
    const inventory = await service.reserveStock(
      req.params.variantId,
      req.body.quantity,
      req.body.orderId
    );

    return res.status(200).json({
      success: true,
      message: "Stock reserved",
      data: inventory
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const releaseStock = async (req, res) => {
  try {
    const inventory = await service.releaseStock(
      req.params.variantId,
      req.body.quantity,
      req.body.reason
    );

    return res.status(200).json({
      success: true,
      message: "Reserved stock released",
      data: inventory
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getLowStock = async (req, res) => {
  try {
    const inventory = await service.getLowStock();

    return res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await service.acknowledgeAlert(
      req.params.alertId,
      getAdminId(req)
    );

    return res.status(200).json({
      success: true,
      message: "Low-stock alert acknowledged",
      data: alert
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateThreshold = async (req, res) => {
  try {
    const inventory = await service.updateThreshold(
      req.params.variantId,
      req.body.threshold
    );

    return res.status(200).json({
      success: true,
      message: "Low-stock threshold updated",
      data: inventory
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  updateVariant,
  submitForPublishing,
  publishProduct,
  archiveProduct,
  restoreProduct,
  adjustStock,
  reserveStock,
  releaseStock,
  getLowStock,
  acknowledgeAlert,
  updateThreshold,
  createVariant,
  deleteVariant
};