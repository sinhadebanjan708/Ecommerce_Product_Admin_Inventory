const router = require("express").Router();

const controller = require("../controllers/payment.controller");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

router.post(
  "/:orderId/create",
 ...customerOnly,
  controller.createPayment
);

// Register the gateway webhook separately.
// It should use raw request body and signature verification,
// not ordinary customer JWT authentication.

module.exports = router;