const router = require("express").Router();

const controller = require("../controllers/checkout.controller");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

router.post("/create-order", ...customerOnly, controller.createOrder);

// GET CHECKOUT SUMMARY
router.get(
  "/summary",
  ...customerOnly,
  controller.getCheckoutSummary
);

// SELECT DELIVERY ADDRESS
router.patch(
  "/address",
  ...customerOnly,
  controller.selectDeliveryAddress
);

module.exports = router;