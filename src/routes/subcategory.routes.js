
const express = require("express");
const router = express.Router();

const subcategoryController = require("../controllers/subcategory.controller");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const adminOnly = [
  authMiddleware,
  authorizeRoles("ADMIN")
];

// Customer-facing routes
router.get("/", subcategoryController.getSubcategories);

router.get(
  "/sub-category/:categoryId",
  subcategoryController.getSubcategoriesByCategory
);

router.get("/sub-category/:id", subcategoryController.getSubcategoryById);

// Admin-only routes
router.post(
  "/sub-category",
...adminOnly,
  subcategoryController.createSubcategory
);

router.put(
  "/sub-category/:id",
  ...adminOnly,
  subcategoryController.updateSubcategory
);

router.delete(
  "/sub-category/:id",
  ...adminOnly,
  subcategoryController.deleteSubcategory
);

module.exports = router;
