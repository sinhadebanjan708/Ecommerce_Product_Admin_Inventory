const router = require("express").Router();


const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

const controller =
  require("../controllers/customerProduct.controller");

router.get("/", ...customerOnly ,controller.getProducts);

router.get("/:productId", ...customerOnly, controller.getProductDetails);

router.get(
  "/../variants/:variantId/availability",...customerOnly,
  controller.checkAvailability
);

module.exports = router;