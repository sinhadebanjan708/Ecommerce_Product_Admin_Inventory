
const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

const uploadCategory = require("../middleware/uploadCategory");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const adminOnly = [
  authMiddleware,
  authorizeRoles("ADMIN")
];

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

// Customer-facing routes
router.get("/", ...customerOnly ,categoryController.getCategories);
router.get("/:id", ...customerOnly, categoryController.getCategoryById);

// Admin-only routes
router.post(
  "/",
  ...adminOnly,
    uploadCategory.single("image"),
  categoryController.createCategory
);

router.put(
  "/:categoryId",
 ...adminOnly,
   uploadCategory.single("image"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  ...adminOnly,
  categoryController.deleteCategory
);

module.exports = router;
