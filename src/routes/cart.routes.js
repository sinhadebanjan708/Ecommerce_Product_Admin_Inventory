const router = require("express").Router();

const controller = require("../controllers/cart.controller");

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleWare");

const customerOnly = [
  authMiddleware,
  authorizeRoles("CUSTOMER")
];

router.get("/", ...customerOnly, controller.getCart);
router.post("/items", ...customerOnly, controller.addItem);
router.put("/items/:itemId", ...customerOnly, controller.updateItem);
router.delete("/items/:itemId", ...customerOnly, controller.removeItem);

module.exports = router;