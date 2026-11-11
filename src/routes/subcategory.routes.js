
const express = require("express");
const router = express.Router();

const subcategoryController = require("../controllers/subcategory.controller");
const {
    subcategoryUpload
} = require("../middleware/uploadMiddleware");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const adminOnly = [
  authMiddleware,
  authorizeRoles("ADMIN")
];

const customerAdmin = [
  authMiddleware,
  authorizeRoles("ADMIN", "CUSTOMER")
];

// Customer-facing routes
router.get("/", ...customerAdmin ,subcategoryController.getSubcategories);

router.get(
  "/:categoryId",
  ...customerAdmin,
  subcategoryController.getSubcategoriesByCategory
);

router.get("/subcategories/:subcategoryId", ...customerAdmin, subcategoryController.getSubcategoryById);

// Admin-only routes
router.post(
  "/",
...adminOnly,
  subcategoryUpload.single("image"),
  subcategoryController.createSubcategory
);

router.put(
  "/:id",
  ...adminOnly,
    subcategoryUpload.single("image"),
  subcategoryController.updateSubcategory
);

router.delete(
  "/:id",
  ...adminOnly,
  subcategoryController.deleteSubcategory
);

module.exports = router;
