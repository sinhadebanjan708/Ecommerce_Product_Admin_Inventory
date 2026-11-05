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

router.post("/", ...customerOnly, controller.createOrder);

module.exports = router;