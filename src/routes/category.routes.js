
const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");

const uploadCategory = require("../middleware/uploadCategory");
const {
    categoryUpload
} = require("../middleware/uploadMiddleware");

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
    categoryUpload.single("image"),
  categoryController.createCategory
);

router.put(
  "/:categoryId",
 ...adminOnly,
   categoryUpload.single("image"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  ...adminOnly,
  categoryController.deleteCategory
);

module.exports = router;
