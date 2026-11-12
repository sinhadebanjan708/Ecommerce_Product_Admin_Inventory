const express = require("express");
const router = express.Router();

const controller = require(
  "../controllers/adminProduct.controller"
);

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const {
    productUpload,productVariantUpload
} = require("../middleware/uploadMiddleware");

const adminOnly = [
  authMiddleware,
  authorizeRoles("ADMIN")
];

// Products
router.post("/products", ...adminOnly,   productUpload.single("image"), controller.createProduct);

router.get("/products", ...adminOnly, controller.listProducts);

router.get(
  "/products/:productId",
  ...adminOnly,
  controller.getProductById
);

router.put(
  "/products/:productId",
   ...adminOnly,
  controller.updateProduct
);

router.post(
  "/products/:productId/variants",
 ...adminOnly, productVariantUpload.array("images", 4),
  controller.createVariant
);
router.put(
  "/products/:productId/variants/:variantId",
  ...adminOnly,
  controller.updateVariant
);

router.delete(
  "/products/:productId/variants/:variantId",
...adminOnly,
  controller.deleteVariant
);

router.post(
  "/products/:productId/submit-for-publishing",
  ...adminOnly,
  controller.submitForPublishing
);

router.post(
  "/products/:productId/publish",
  ...adminOnly,
  controller.publishProduct
);

router.post(
  "/products/:productId/archive",
  ...adminOnly,
  controller.archiveProduct
);

router.post(
  "/products/:productId/restore",
  ...adminOnly,
  controller.restoreProduct
);

// Inventory
router.post(
  "/inventory/:variantId/adjust",
  ...adminOnly,
  controller.adjustStock
);

router.post(
  "/inventory/:variantId/reserve",
  ...adminOnly,
  controller.reserveStock
);

router.post(
  "/inventory/:variantId/release",
  ...adminOnly,
  controller.releaseStock
);

router.get(
  "/inventory/low-stock",
  ...adminOnly,
  controller.getLowStock
);

router.put(
  "/inventory/alerts/:alertId/acknowledge",
  ...adminOnly,
  controller.acknowledgeAlert
);

router.put(
  "/inventory/:variantId/threshold",
  ...adminOnly,
  controller.updateThreshold
);

module.exports = router;